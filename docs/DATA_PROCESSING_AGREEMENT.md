# Data Processing Agreement (Auftragsverarbeitung)

**GDPR Article 28 Compliant**

## 1. Contracting Parties

### Data Controller
- **Name:** [COMPANY NAME]
- **Address:** [STREET ADDRESS, CITY, STATE ZIP]
- **Email:** [EMAIL ADDRESS]
- **Phone:** [PHONE NUMBER]
- **Role:** The entity that determines the purposes and means of data processing

### Data Processors
This agreement covers the following processors who handle personal data on behalf of the Controller:

1. **Resend** (resend.com)
   - **Purpose:** Email delivery and transactional messaging
   - **Data Processed:** Customer emails, names, event details
   - **DPA Location:** https://resend.com/terms

2. **Render** (render.com)
   - **Purpose:** Application hosting, server infrastructure
   - **Data Processed:** All application data (requests, customer info, configuration)
   - **DPA Location:** https://render.com/legal

---

## 2. Scope of Processing

### 2.1 Data Categories
The following categories of personal data are processed:
- **Rental Request Data:**
  - Customer name
  - Email address
  - Event type (wedding, birthday, corporate, etc.)
  - Event date
  - Selected items and quantities
  - Event location/venue information
  - Messages and special requests

- **Admin Data:**
  - Administrator email addresses
  - Login timestamps and session information
  - Admin actions (catalog edits, order confirmations)

- **Server/Technical Data:**
  - IP addresses
  - Browser user agents
  - Page access logs
  - API request logs

### 2.2 Processing Purposes
1. **Fulfilling rental requests** (contract performance)
2. **Sending confirmations and quotes** (contract performance)
3. **Delivery and billing** (contract performance)
4. **Admin panel access and authorization** (security and contract performance)
5. **Website monitoring and security** (legitimate business interest)
6. **Compliance with legal obligations** (tax, accounting records)

### 2.3 Data Subjects
- Customers submitting rental requests
- Event attendees (indirectly, if mentioned in messages)
- Administrators managing the service
- Website visitors (minimal server logs)

### 2.4 Duration of Processing
- **Rental Requests:** Retained indefinitely for business records (subject to data subject deletion requests)
- **Admin Accounts:** For the duration of admin role + 6 months post-transfer
- **Server Logs:** 30 days (automatic purge)
- **Audit Logs:** 90 days (automatic purge)

---

## 3. Security Measures (GDPR Art. 32)

The Controller and Processors implement the following technical and organizational security measures:

### 3.1 Encryption & Data in Transit
- **TLS/SSL:** All data in transit is encrypted with TLS 1.2 or higher
- **HTTPS Enforcement:** All website pages served over HTTPS only
- **Secure Headers:** Implemented including HSTS, X-Frame-Options, CSP

### 3.2 Data at Rest
- **JSON File Encryption:** Data files are stored on secure, access-restricted servers
- **Access Control:** Only authorized administrators can access data files
- **Backup Protection:** Backups are encrypted and stored securely

### 3.3 Authentication & Authorization
- **Passwordless Admin Login:** Email-based magic links (no password storage)
- **Session Management:** Secure session tokens with httpOnly flags
- **Token Expiration:** Login links expire after 30 minutes
- **Role-Based Access:** Admin vs. Viewer roles enforce authorization

### 3.4 Audit & Monitoring
- **Activity Logging:** All data access, exports, and deletions are logged (Art. 5 accountability)
- **Audit Trails:** Logs retained for 90 days, then automatically purged
- **Monitoring:** Regular security monitoring for unauthorized access attempts
- **Incident Response:** Procedures in place for data breach detection and notification

### 3.5 Data Minimization
- **Least Privilege:** Only necessary data is collected
- **No Profiling:** No behavioral tracking or analytics profiling
- **No Sharing:** Data never shared with third parties for marketing

### 3.6 Personnel Security
- **Limited Access:** Only administrators have access to sensitive data
- **Confidentiality:** All personnel agree to confidentiality obligations
- **Training:** Security and compliance training required

---

## 4. Sub-processor Management (GDPR Art. 28(2), (4))

### 4.1 Authorized Sub-processors
The following sub-processors are authorized to process personal data:

| Processor | Purpose | Data Processed | Location | DPA |
|-----------|---------|-----------------|----------|-----|
| Resend | Email delivery | Customer emails, names, event details | EU | [Link](https://resend.com/terms) |
| Render | Application hosting | All application data | EU (Ireland) | [Link](https://render.com/legal) |

### 4.2 Sub-processor Changes
- **Notice:** The Data Controller will provide 30 days' notice before adding or replacing sub-processors
- **Objection Rights:** Data subjects have the right to object to new sub-processors
- **Notification:** Changes will be posted to the Privacy Policy

### 4.3 Sub-processor Agreements
- All sub-processors are bound by equivalent data protection obligations
- All sub-processors maintain GDPR compliance certifications
- All sub-processors are located in the EU or have equivalent protections

---

## 5. Data Subject Rights (GDPR Art. 15-22)

### 5.1 Right of Access (Art. 15)
- Data subjects can request a copy of their personal data
- Requests should be sent to: [EMAIL ADDRESS]
- Response time: Within 30 days

### 5.2 Right to Rectification (Art. 16)
- Data subjects can request correction of inaccurate data
- Requests should be submitted via email

### 5.3 Right to Erasure (Art. 17)
- Data subjects can request deletion of their data via: /gdpr/delete
- Deletions are processed immediately
- Backups purged within 7 days
- Tax records retained as required by law (7 years)

### 5.4 Right to Data Portability (Art. 20)
- Data subjects can export their data via: /gdpr/export
- Available formats: JSON, CSV
- No charge for export
- Export processed immediately

### 5.5 Right to Object (Art. 21)
- Data subjects can object to certain processing
- Requests should be sent to: [EMAIL ADDRESS]

### 5.6 Right to Lodge a Complaint
- Data subjects can file complaints with their local Data Protection Authority
- In Germany: Contact your state's Datenschutzbehörde
- [EU DPA Contacts](https://edpb.europa.eu/about-edpb/board/members_en)

---

## 6. International Data Transfers

### 6.1 Processing Locations
- **Primary:** Germany (EU)
- **Backup/Hosting:** Ireland (EU) via Render
- **Email Service:** EU-based via Resend

### 6.2 Non-EU Transfers
Currently, no data is transferred outside the EU. If this changes:
- Standard Contractual Clauses (SCC) will be implemented
- Transfer Impact Assessments will be conducted
- Data subjects will be notified

---

## 7. Data Breach Notification (GDPR Art. 33-34)

### 7.1 Detection & Assessment
- Automated monitoring for unauthorized access
- Incident response procedures in place
- Assessment of breach severity and impact

### 7.2 Authority Notification
- **Timeline:** Within 72 hours of discovery
- **Recipient:** Competent Data Protection Authority
- **Information:** Nature of breach, data affected, likely consequences, measures taken

### 7.3 Data Subject Notification
- **Timeline:** Without undue delay if high risk
- **Method:** Email and/or website notification
- **Content:** Nature of breach, data affected, advice on protection measures
- **Exception:** No notification if data was encrypted/pseudonymized

### 7.4 Documentation
- All breaches are documented with:
  - Date and time discovered
  - Date and time of breach
  - Number of affected individuals
  - Likely consequences
  - Measures taken to contain
  - Notification status

---

## 8. Data Processing Instructions

### 8.1 Controller Instructions
The Processors shall process personal data only upon written instructions from the Controller:
1. Fulfilling customer rental requests
2. Sending transactional emails (quotes, confirmations, receipts)
3. Hosting and operating the website
4. Audit logging and security monitoring
5. Responding to lawful data subject requests

### 8.2 No Independent Processing
Processors shall NOT:
- Share data with third parties
- Use data for their own purposes
- Create derivative works or profiles
- Market or sell data
- Transfer data outside authorized locations

### 8.3 Amendment of Instructions
The Controller may amend processing instructions with 15 days' notice. Processors shall comply with amended instructions.

---

## 9. Processor Responsibilities

### 9.1 Confidentiality
- All processor personnel are bound by confidentiality
- Confidentiality obligations survive contract termination
- No disclosure of data to third parties without Controller authorization

### 9.2 Security
- Processors maintain security measures per Art. 32
- Processors conduct regular security assessments
- Processors implement staff training and security protocols

### 9.3 Cooperation
- Processors assist with data subject rights requests
- Processors assist with audit and inspection rights
- Processors provide assistance with DPA updates

### 9.4 Deletion/Return
- Upon contract termination, processors delete or return all personal data
- Data is securely destroyed, not retained
- Evidence of deletion is provided to the Controller

---

## 10. Audit & Inspection Rights (GDPR Art. 28(3)(h))

### 10.1 Audit Authority
The Data Controller has the right to:
- Audit processor security measures
- Inspect processor facilities and systems
- Request security certifications (ISO 27001, SOC 2)
- Conduct compliance checks

### 10.2 Audit Procedures
- Audits may be scheduled (30 days' notice) or unscheduled
- Processors shall cooperate fully
- Audit findings shall be documented
- Remediation timelines established for findings

### 10.3 Certifications
Current certifications maintained by processors:
- **Resend:** SOC 2 Type II compliant
- **Render:** ISO 27001 certified

---

## 11. Subprocessor Agreements

### 11.1 Resend Terms
- **URL:** https://resend.com/terms
- **DPA:** Equivalent data protection obligations
- **Certification:** SOC 2 Type II
- **Jurisdiction:** US company with EU processing

### 11.2 Render Terms
- **URL:** https://render.com/legal
- **DPA:** Standard data protection clauses
- **Certification:** ISO 27001
- **Jurisdiction:** EU hosting, Ireland data center

---

## 12. Termination & Data Handling

### 12.1 Contract Termination
Upon termination of this agreement:
- Processors immediately cease processing personal data
- All personal data is securely deleted (not transferred)
- Deletion is completed within 30 days
- Written confirmation of deletion is provided

### 12.2 Exception
Data may be retained if required by law (tax records, legal holds). Retention is limited to the period required by law.

---

## 13. Compliance & Enforcement

### 13.1 Liability
- Processor is liable for damages caused by non-compliance
- Controller is liable for controller-specific violations
- Both parties liable for joint responsibilities

### 13.2 Amendments
This agreement is reviewed annually and updated to reflect:
- GDPR regulatory changes
- New sub-processors
- Updated security measures
- Data subject feedback

### 13.3 Effective Date
- **Effective:** September 1, 2024
- **Last Updated:** September 1, 2026
- **Next Review:** September 1, 2027

---

## Appendix A: Data Processing Addendum (DPA) Signature

By using this service or continuing operations, both parties acknowledge and agree to be bound by the terms of this Data Processing Agreement.

**Data Controller Representative:**
- Name: _________________________
- Title: _________________________
- Signature: _____________________
- Date: _________________________

**Data Processor Representative (Resend & Render):**
By accepting these terms through their standard Terms of Service, both processors acknowledge equivalent data protection obligations.

---

## Appendix B: Frequently Updated Elements

### B.1 Sub-processor List
**Last Updated:** September 1, 2026

**Current Authorized Processors:**
1. Resend (resend.com) - Email delivery
2. Render (render.com) - Web hosting

**Planned Future Processors:**
- Database provider (if migration occurs)
- Backup/disaster recovery service (if added)

### B.2 Security Certifications
- Render: ISO 27001 (valid through 2027)
- Resend: SOC 2 Type II (valid through 2025)

### B.3 Contact Information
- **Data Protection Officer:** [EMAIL ADDRESS]
- **Privacy/Compliance Questions:** [EMAIL ADDRESS]
- **Incident/Breach Reporting:** [EMAIL ADDRESS]

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-01 | Initial DPA creation for GDPR Art. 28 compliance |

---

**This agreement is living document and subject to periodic review and amendment to ensure continued GDPR compliance.**
