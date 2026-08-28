from typing import Dict, TypedDict, Any
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import os
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Basic State definition
class AgentState(TypedDict):
    query: str
    intent: str
    response: str
    messages: list

class RealEstateAgent:
    def __init__(self):
        # We need an API key for Groq, typically from environment GROQ_API_KEY
        self.llm = ChatGroq(model_name="llama3-8b-8192", temperature=0.1)
        self.graph = self._build_graph()
        
    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        # Define nodes
        workflow.add_node("router", self.route_query)
        workflow.add_node("property_search", self.handle_property_search)
        workflow.add_node("chit_chat", self.handle_chit_chat)
        
        # Define edges
        workflow.set_entry_point("router")
        
        # Conditional edges from router
        workflow.add_conditional_edges(
            "router",
            lambda state: state["intent"],
            {
                "property_search": "property_search",
                "chit_chat": "chit_chat"
            }
        )
        
        # Edges to END
        workflow.add_edge("property_search", END)
        workflow.add_edge("chit_chat", END)
        
        return workflow.compile()
        
    def route_query(self, state: AgentState) -> AgentState:
        query = state["query"]
        
        system_prompt = """You are a router for a real estate platform. 
Determine if the user's query is related to searching for properties (e.g. 'find 2bhk in bandra', 'show houses under 50000') 
or if it is general chit-chat/questions (e.g. 'hi', 'how are you', 'what is real estate').
Output ONLY a JSON object with a single key 'intent' and value either 'property_search' or 'chit_chat'."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=query)
        ]
        
        try:
            # Generate the response
            ai_msg = self.llm.invoke(messages)
            content = ai_msg.content.strip()
            
            # Basic parsing, handling potential markdown blocks
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()
                
            result = json.loads(content)
            intent = result.get("intent", "chit_chat")
            
            if intent not in ["property_search", "chit_chat"]:
                intent = "chit_chat"
                
        except Exception as e:
            logger.error(f"Error in router: {e}")
            intent = "chit_chat"
            
        return {"intent": intent}

    def handle_property_search(self, state: AgentState) -> AgentState:
        query = state["query"]
        
        system_prompt = """You are a helpful real estate assistant.
The user is looking for properties. Acknowledge their request and ask clarifying questions 
if they haven't provided enough details (e.g., location, budget, property type, BHK).
If they have provided details, confirm them."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=query)
        ]
        
        ai_msg = self.llm.invoke(messages)
        return {"response": ai_msg.content}
        
    def handle_chit_chat(self, state: AgentState) -> AgentState:
        query = state["query"]
        
        system_prompt = """You are a friendly assistant for a real estate platform called Props.ai.
Respond politely to the user and guide them to search for properties."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=query)
        ]
        
        ai_msg = self.llm.invoke(messages)
        return {"response": ai_msg.content}
        
    def process_query(self, query: str) -> str:
        state = {
            "query": query,
            "intent": "",
            "response": "",
            "messages": []
        }
        
        try:
            result = self.graph.invoke(state)
            return result.get("response", "I'm sorry, I encountered an error.")
        except Exception as e:
            logger.error(f"Error in graph execution: {e}")
            return "An error occurred while processing your request."

if __name__ == "__main__":
    agent = RealEstateAgent()
    print("Agent initialized successfully. (Requires GROQ_API_KEY to process queries)")
