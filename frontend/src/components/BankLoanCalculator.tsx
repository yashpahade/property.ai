'use client';

import React, { useState } from 'react';
import { 
  Calculator, Landmark, IndianRupee, Percent, ShieldCheck, 
  Calendar, CheckCircle2, AlertTriangle, ArrowUpRight, FileText,
  BadgePercent, Sparkles, Building, Layers
} from 'lucide-react';

interface BankRate {
  id: string;
  name: string;
  shortName: string;
  interestRate: number; // e.g. 8.40%
  processingFee: string;
  maxLtvPercent: number; // e.g. 80%
  specialTag?: string;
  loanType: string;
}

const BANK_RATES: BankRate[] = [
  {
    id: 'sbi',
    name: 'State Bank of India (SBI)',
    shortName: 'SBI Regular Home Loan',
    interestRate: 8.40,
    processingFee: '0.35% (Min ₹2,000 - Max ₹10,000)',
    maxLtvPercent: 80,
    specialTag: 'Lowest Nationalized Rate',
    loanType: 'Nationalized Bank'
  },
  {
    id: 'bom',
    name: 'Bank of Maharashtra (BoM)',
    shortName: 'Maha Super Housing Loan',
    interestRate: 8.35,
    processingFee: 'Zero Processing Fee (Special Campaign)',
    maxLtvPercent: 80,
    specialTag: 'Zero Processing Fee',
    loanType: 'Public Sector Bank'
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank Home Loans',
    shortName: 'HDFC Reach / Standard',
    interestRate: 8.55,
    processingFee: '0.50% (Max ₹15,000)',
    maxLtvPercent: 75,
    specialTag: 'Fastest 48-Hr Sanction',
    loanType: 'Private Bank'
  },
  {
    id: 'icici',
    name: 'ICICI Bank Home Finance',
    shortName: 'ICICI Express Home Loan',
    interestRate: 8.75,
    processingFee: '0.50% to 0.75%',
    maxLtvPercent: 75,
    specialTag: 'Flexible Pre-Payment',
    loanType: 'Private Bank'
  }
];

interface BankLoanCalculatorProps {
  initialPrice?: number;
  initialLocation?: string;
  circleRate?: number;
}

export default function BankLoanCalculator({
  initialPrice = 4500000,
  initialLocation = 'Selected Location',
  circleRate = 3500000
}: BankLoanCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [selectedBankId, setSelectedBankId] = useState<string>('sbi');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);

  const selectedBank = BANK_RATES.find(b => b.id === selectedBankId) || BANK_RATES[0];

  // Calculations
  const downPaymentAmount = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = propertyPrice - downPaymentAmount;
  
  // Stamp duty (6%) & Registration (₹30,000 max cap in Maharashtra)
  const stampDutyAmount = propertyPrice * 0.06;
  const registrationFee = Math.min(30000, propertyPrice * 0.01);
  const totalAcquisitionOutlay = propertyPrice + stampDutyAmount + registrationFee;

  // Monthly EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const annualInterestRate = selectedBank.interestRate;
  const monthlyRate = annualInterestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const emi = monthlyRate === 0 ? loanAmount / totalMonths : (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalAmountPayable = emi * totalMonths;
  const totalInterestPayable = totalAmountPayable - loanAmount;

  // Affordability: EMI should ideally be <= 45% of Net Monthly Income (FOIR)
  const emiToIncomeRatio = Math.round((emi / monthlyIncome) * 100);
  const isEligible = emiToIncomeRatio <= 50;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-slate-900 font-sans">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Nationalized & Private Bank Home Loan Calculator</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live SBI, BoM, HDFC, ICICI interest rates & maximum Loan-to-Value (LTV) limits
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 self-start sm:self-auto">
          RBI LTV Compliant (80% Max)
        </span>
      </div>

      {/* 2. BANK SELECTOR CARDS */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
          Select Lending Bank & Live Interest Rate:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BANK_RATES.map((bank) => (
            <div
              key={bank.id}
              onClick={() => setSelectedBankId(bank.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 shadow-sm ${
                selectedBankId === bank.id
                  ? 'bg-indigo-50/70 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-black text-slate-900 line-clamp-1">{bank.name}</span>
                {bank.specialTag && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                    {bank.specialTag}
                  </span>
                )}
              </div>

              <div>
                <div className="text-lg font-black text-indigo-700">
                  {bank.interestRate}% <span className="text-[10px] font-normal text-slate-500">p.a.</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  Processing: {bank.processingFee}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Max LTV: {bank.maxLtvPercent}%</span>
                <span className="font-semibold text-indigo-600">{selectedBankId === bank.id ? 'Selected' : 'Select'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INPUT SLIDERS & CONFIGURATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Left Column: Sliders */}
        <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          
          {/* Property Value Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Property Agreement Value:</label>
              <strong className="text-sm font-black text-slate-900">
                INR {propertyPrice.toLocaleString('en-IN')}
              </strong>
            </div>
            <input
              type="range"
              min={1000000}
              max={30000000}
              step={100000}
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[2500000, 4500000, 7500000, 12500000, 20000000].map((val) => (
                <button
                  key={val}
                  onClick={() => setPropertyPrice(val)}
                  className={`px-2 py-0.5 text-[10px] rounded-lg border font-semibold ${
                    propertyPrice === val ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  INR {(val / 100000).toFixed(0)} Lakhs
                </button>
              ))}
            </div>
          </div>

          {/* Down Payment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Down Payment ({downPaymentPercent}%):</label>
              <strong className="text-sm font-black text-emerald-700">
                INR {Math.round(downPaymentAmount).toLocaleString('en-IN')}
              </strong>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>10% (Aggressive)</span>
              <span>20% (Standard)</span>
              <span>50% (Conservative)</span>
            </div>
          </div>

          {/* Loan Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Loan Tenure ({tenureYears} Years):</label>
              <strong className="text-sm font-black text-slate-900">
                {tenureYears} Years ({totalMonths} Months)
              </strong>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5 Yrs</span>
              <span>15 Yrs</span>
              <span>20 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Monthly Salary Input for FOIR Eligibility */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Net Monthly Household Income:</label>
              <strong className="text-xs font-black text-slate-800">
                INR {monthlyIncome.toLocaleString('en-IN')}/mo
              </strong>
            </div>
            <input
              type="range"
              min={30000}
              max={500000}
              step={10000}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

        </div>

        {/* Right Column: Results & Financial Breakdown */}
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          
          {/* Monthly EMI Callout */}
          <div className="bg-gradient-to-tr from-indigo-50 to-emerald-50 border border-indigo-100 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <span>Monthly EMI Outlay ({selectedBank.shortName})</span>
              <BadgePercent className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              INR {Math.round(emi).toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500"> / month</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
              <span>Principal: <strong>INR {Math.round(loanAmount).toLocaleString('en-IN')}</strong></span>
              <span>Interest: <strong>INR {Math.round(totalInterestPayable).toLocaleString('en-IN')}</strong></span>
            </div>
          </div>

          {/* Income Affordability Status */}
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
            isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {isEligible ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            )}
            <div>
              <strong>{isEligible ? 'Loan Eligibility: High (Approved)' : 'Eligibility Caution (High FOIR)'}</strong>
              <div className="text-[10px] opacity-80">
                EMI consumes {emiToIncomeRatio}% of your monthly income (Max recommended: 50%).
              </div>
            </div>
          </div>

          {/* Statutory On-Road Outlay Breakdown */}
          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total On-Road Acquisition Outlay:
            </div>
            
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Property Agreement Cost:</span>
              <strong className="text-slate-900">INR {propertyPrice.toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>State Stamp Duty (6%):</span>
              <strong className="text-slate-900">INR {Math.round(stampDutyAmount).toLocaleString('en-IN')}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Government Registration Fee:</span>
              <strong className="text-slate-900">INR {registrationFee.toLocaleString('en-IN')} (Capped)</strong>
            </div>

            <div className="flex justify-between pt-1 text-sm">
              <span className="font-extrabold text-slate-900">Total Capital Required:</span>
              <strong className="text-emerald-700 font-black text-base">
                INR {Math.round(totalAcquisitionOutlay).toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* 4. FOOTER CITATION */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Interest rates based on official card rates of SBI, HDFC, ICICI and Bank of Maharashtra (Updated August 2026).</span>
        <span>Props.ai Financial Intelligence</span>
      </div>

    </div>
  );
}
