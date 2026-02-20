#!/usr/bin/env python3
"""
Create professional README files for all project folders with disclaimers.
"""
import os

# Project folders and their details
projects = [
    {
        "folder": r"C:\Users\sorat\Desktop\Coding\awani_fraud_detection_audit",
        "name": "Neural-Net Fraud Detection System",
        "description": "Machine learning-powered fraud detection using Isolation Forest and K-Means clustering",
        "tech": "Python, scikit-learn, Pandas, Excel Automation",
        "features": [
            "ML anomaly detection with 87.3% accuracy",
            "Manager discount rate analysis with risk scoring",
            "Hourly transaction pattern heat mapping",
            "Location-based risk assessment",
            "Automated recovery identification (SAR 4.2M)"
        ]
    },
    {
        "folder": r"C:\Users\sorat\Desktop\Coding\internal_audit_tracker_bateel",
        "name": "Enterprise Audit Management Platform",
        "description": "Comprehensive audit tracker with executive dashboards and governance reporting",
        "tech": "Python, openpyxl, python-pptx",
        "features": [
            "Director dashboard with real-time KPIs",
            "Multi-entity audit planning and tracking",
            "Automated PowerPoint presentations",
            "3-tier governance reporting structure",
            "Risk-based audit scheduling"
        ]
    },
    {
        "folder": r"C:\Users\sorat\Desktop\Coding\bateel_food_safety_risk_framework",
        "name": "Food Safety Risk Assessment Framework",
        "description": "Advanced risk management framework for F&B operations",
        "tech": "Python, Risk Analytics, Compliance Frameworks",
        "features": [
            "Risk heat mapping across 70+ locations",
            "Control validation and testing",
            "Compliance tracking and monitoring",
            "Mitigation roadmap generation",
            "Executive risk reporting"
        ]
    },
    {
        "folder": r"C:\Users\sorat\Desktop\Coding\cv_fraud_report_generator",
        "name": "Forensic Fraud Investigation Toolkit",
        "description": "Professional forensic analysis toolkit for fraud investigations",
        "tech": "Python, Excel Automation, Forensic Accounting",
        "features": [
            "Control failure mapping and documentation",
            "Evidence tracking with chain of custody",
            "Litigation support report generation",
            "Major fraud case analysis",
            "Recovery action planning"
        ]
    },
    {
        "folder": r"C:\Users\sorat\Desktop\Coding\audit_committee_services_toolkit",
        "name": "Multi-Location Audit Compliance System",
        "description": "Standardized audit procedures for multi-location operations",
        "tech": "Python, openpyxl, Audit Standards",
        "features": [
            "Comprehensive audit checklists",
            "Compliance tracking across locations",
            "Remediation monitoring",
            "Action plan reporting",
            "Standardized procedures"
        ]
    },
    {
        "folder": r"C:\Users\sorat\Desktop\Coding\kitopi_ml_fraud_icaew_audit",
        "name": "ICAEW Audit Report System",
        "description": "Professional audit reporting compliant with ICAEW standards",
        "tech": "Python, ICAEW Standards, Report Automation",
        "features": [
            "ICAEW-compliant report generation",
            "Testing methodology documentation",
            "Evidence management",
            "Automated audit documentation",
            "Professional report formatting"
        ]
    }
]

README_TEMPLATE = """# {name}

## 📋 Project Overview

{description}

**Technology Stack:** {tech}

## 🎯 Key Features

{features}

## ⚠️ Data Confidentiality Notice

**IMPORTANT:** This project contains **anonymized and dummy data** for demonstration purposes only.

- All client names, financial figures, and personal information have been replaced with fictitious data
- The technical implementation, algorithms, and methodologies are genuine and representative of production work
- Data structures and analysis patterns reflect real-world audit scenarios
- No confidential or proprietary client information is included

## 🔒 Professional Use

This project demonstrates:
- ✓ Technical capabilities in audit automation and data analysis
- ✓ Understanding of audit frameworks and compliance requirements
- ✓ Proficiency in Python, Excel automation, and reporting tools
- ✓ Ability to deliver enterprise-grade audit solutions

## 📞 Access Request

This project is available for review by **potential employers and clients** for capability assessment purposes.

**To request access to the full source code:**

📧 Email: [majidrajpar@gmail.com](mailto:majidrajpar@gmail.com?subject=Source%20Code%20Request%3A%20{name_encoded}&body=Hello%20Majid%2C%0A%0AI%20am%20interested%20in%20reviewing%20the%20source%20code%20for%20the%20{name_encoded}%20project%20to%20assess%20your%20technical%20capabilities.%0A%0AOrganization%3A%20%0ARole%2FTitle%3A%20%0APurpose%3A%20%0A%0AThank%20you%2C)

Please include:
- Your organization name
- Your role/title
- Purpose of review (hiring evaluation, project inquiry, etc.)

---

## 👨‍💼 About the Developer

**Majid Mumtaz**
Chief Audit Executive | Internal Audit Director

- 📜 CIA, ACA, FCCA (Chartered Accountant)
- 🎓 Harvard Business School Online, COSO ERM
- 🤖 Machine Learning (IBM), Python/Pandas Analytics
- 🌍 Dubai, UAE (Golden Visa) | 20+ years GCC experience

**Portfolio:** [https://majidrajpar.github.io/portfolio_my/](https://majidrajpar.github.io/portfolio_my/)
**LinkedIn:** [https://www.linkedin.com/in/majid-m-4b097118/](https://www.linkedin.com/in/majid-m-4b097118/)

---

*This README is part of a professional portfolio showcasing audit automation and risk analytics capabilities. All data is anonymized for confidentiality.*
"""

def create_readme(project):
    """Create README for a project folder."""
    readme_path = os.path.join(project["folder"], "README_PORTFOLIO.md")

    # Format features as bullet points
    features_text = "\n".join([f"- {feature}" for feature in project["features"]])

    # URL encode project name for email
    name_encoded = project["name"].replace(" ", "%20")

    # Generate README content
    content = README_TEMPLATE.format(
        name=project["name"],
        description=project["description"],
        tech=project["tech"],
        features=features_text,
        name_encoded=name_encoded
    )

    # Write README
    try:
        with open(readme_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Created README for: {project['name']}")
        return True
    except Exception as e:
        print(f"✗ Failed for {project['name']}: {e}")
        return False

if __name__ == "__main__":
    print("📝 Creating Professional README Files for All Projects")
    print("=" * 70)

    success_count = 0
    for project in projects:
        if create_readme(project):
            success_count += 1

    print("\n" + "=" * 70)
    print(f"✅ Created {success_count}/{len(projects)} README files")
    print("\nEach project folder now has:")
    print("  • Professional README_PORTFOLIO.md")
    print("  • Disclaimer about anonymized data")
    print("  • Contact information for source code access")
