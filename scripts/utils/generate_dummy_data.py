#!/usr/bin/env python3
"""
Dummy Data Generator for Portfolio Screenshots
Generates realistic but fake data for sanitized project screenshots
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import string

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

class DummyDataGenerator:
    """Generate sanitized dummy data for portfolio projects"""

    def __init__(self):
        self.branches = [f"Branch {i:02d}" for i in range(1, 51)]
        self.employees = [f"Employee {i:03d}" for i in range(1, 101)]
        self.vendors = [f"Vendor {chr(65+i)}" for i in range(20)]
        self.regions = ["North", "South", "East", "West", "Central"]

    def generate_transaction_data(self, n_rows=1000, filename="transactions.csv"):
        """Generate transaction data for fraud detection screenshots"""
        print(f"Generating {n_rows} transaction records...")

        start_date = datetime(2025, 1, 1)
        dates = [start_date + timedelta(days=random.randint(0, 365)) for _ in range(n_rows)]

        data = {
            'Date': dates,
            'Transaction_ID': [f"TXN{i:06d}" for i in range(1, n_rows + 1)],
            'Amount': np.random.normal(500, 200, n_rows).round(2),
            'Location': [random.choice(self.branches) for _ in range(n_rows)],
            'Employee': [random.choice(self.employees) for _ in range(n_rows)],
            'Category': np.random.choice(['Food', 'Beverage', 'Supplies', 'Services', 'Other'], n_rows),
            'Status': np.random.choice(['Approved', 'Pending', 'Flagged'], n_rows, p=[0.85, 0.10, 0.05])
        }

        # Add some anomalies for fraud detection demo
        anomaly_indices = np.random.choice(n_rows, size=int(n_rows * 0.05), replace=False)
        data['Amount'][anomaly_indices] *= np.random.uniform(3, 10, len(anomaly_indices))

        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        print(f"✓ Saved: {filename}")
        return df

    def generate_financial_data(self, filename="financial_dashboard.csv"):
        """Generate financial data for Finance Dashboard screenshots"""
        print("Generating financial dashboard data...")

        months = pd.date_range('2025-01-01', periods=12, freq='M')

        data = []
        for month in months:
            for branch in self.branches[:10]:  # Top 10 branches
                data.append({
                    'Month': month.strftime('%Y-%m'),
                    'Branch': branch,
                    'Region': random.choice(self.regions),
                    'Revenue': np.random.uniform(80000, 150000),
                    'Cost': np.random.uniform(50000, 100000),
                    'Currency': random.choice(['AED', 'SAR', 'USD', 'EUR', 'GBP'])
                })

        df = pd.DataFrame(data)
        df['Profit'] = df['Revenue'] - df['Cost']
        df['Margin_%'] = ((df['Profit'] / df['Revenue']) * 100).round(2)

        df.to_csv(filename, index=False)
        print(f"✓ Saved: {filename}")
        return df

    def generate_audit_findings(self, filename="audit_findings.csv"):
        """Generate audit findings for Audit Tools screenshots"""
        print("Generating audit findings data...")

        risk_levels = ['Critical', 'High', 'Medium', 'Low']
        statuses = ['Open', 'In Progress', 'Resolved', 'Overdue']

        data = {
            'Finding_ID': [f"AUD{i:04d}" for i in range(1, 51)],
            'Title': [f"Control Deficiency - Area {chr(65+i%20)}" for i in range(50)],
            'Risk_Level': np.random.choice(risk_levels, 50, p=[0.1, 0.3, 0.4, 0.2]),
            'Status': np.random.choice(statuses, 50, p=[0.2, 0.3, 0.4, 0.1]),
            'Branch': [random.choice(self.branches) for _ in range(50)],
            'Assigned_To': [random.choice(self.employees) for _ in range(50)],
            'Due_Date': [(datetime.now() + timedelta(days=random.randint(-30, 90))).strftime('%Y-%m-%d') for _ in range(50)],
            'Age_Days': np.random.randint(1, 180, 50)
        }

        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        print(f"✓ Saved: {filename}")
        return df

    def generate_forensic_data(self, filename="forensic_evidence.csv"):
        """Generate forensic investigation data"""
        print("Generating forensic evidence data...")

        data = {
            'Evidence_ID': [f"EVD{i:05d}" for i in range(1, 101)],
            'Type': np.random.choice(['Document', 'Email', 'Transaction', 'Invoice', 'Contract'], 100),
            'Date_Collected': [(datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%d') for _ in range(100)],
            'Custodian': [random.choice(self.employees) for _ in range(100)],
            'Hash_SHA256': [''.join(random.choices(string.hexdigits.lower(), k=64)) for _ in range(100)],
            'Status': np.random.choice(['Verified', 'Pending', 'Flagged'], 100, p=[0.7, 0.2, 0.1]),
            'Risk_Score': np.random.randint(1, 100, 100)
        }

        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        print(f"✓ Saved: {filename}")
        return df

    def generate_risk_assessment(self, filename="risk_assessment.csv"):
        """Generate risk assessment matrix data"""
        print("Generating risk assessment data...")

        processes = [
            "Revenue Recognition", "Procurement", "Inventory Management",
            "Cash Handling", "IT Security", "Data Privacy", "Vendor Management",
            "Financial Reporting", "Compliance Monitoring", "Asset Management"
        ]

        data = {
            'Process': processes,
            'Likelihood': np.random.choice(['Low', 'Medium', 'High', 'Very High'], len(processes)),
            'Impact': np.random.choice(['Low', 'Medium', 'High', 'Critical'], len(processes)),
            'Inherent_Risk_Score': np.random.randint(5, 25, len(processes)),
            'Control_Effectiveness': np.random.choice(['Weak', 'Moderate', 'Strong', 'Very Strong'], len(processes)),
            'Residual_Risk_Score': np.random.randint(1, 15, len(processes)),
            'Mitigation_Status': np.random.choice(['Not Started', 'In Progress', 'Completed'], len(processes))
        }

        df = pd.DataFrame(data)
        df.to_csv(filename, index=False)
        print(f"✓ Saved: {filename}")
        return df

    def generate_all_datasets(self):
        """Generate all dummy datasets for portfolio screenshots"""
        print("\n" + "="*60)
        print("PORTFOLIO DUMMY DATA GENERATOR")
        print("Generating sanitized data for project screenshots")
        print("="*60 + "\n")

        # Create datasets
        self.generate_transaction_data(1000, "1_fraud_detection_transactions.csv")
        self.generate_financial_data("2_finance_dashboard_data.csv")
        self.generate_audit_findings("3_audit_findings.csv")
        self.generate_forensic_data("4_forensic_evidence.csv")
        self.generate_risk_assessment("5_risk_assessment.csv")

        # Generate summary report
        print("\n" + "="*60)
        print("✓ ALL DATASETS GENERATED SUCCESSFULLY!")
        print("="*60)
        print("\nGenerated Files:")
        print("1. 1_fraud_detection_transactions.csv - 1000 transactions")
        print("2. 2_finance_dashboard_data.csv - 120 financial records")
        print("3. 3_audit_findings.csv - 50 audit findings")
        print("4. 4_forensic_evidence.csv - 100 evidence items")
        print("5. 5_risk_assessment.csv - 10 risk assessments")
        print("\nNext Steps:")
        print("1. Open your actual project tools")
        print("2. Import the generated CSV files")
        print("3. Generate dashboards/reports")
        print("4. Capture screenshots (1920px wide minimum)")
        print("5. Save as PNG and optimize to WebP")
        print("\nScreenshot Guidelines:")
        print("- Resolution: Minimum 1920px wide")
        print("- Format: PNG first, then convert to WebP")
        print("- Naming: descriptive-name.png")
        print("- Sanitize: Ensure no real data visible")
        print("- Optimize: Compress to <200KB per image")
        print("="*60 + "\n")

if __name__ == "__main__":
    generator = DummyDataGenerator()
    generator.generate_all_datasets()
