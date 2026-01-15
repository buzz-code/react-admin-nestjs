# Automated Phone Calls Feature Documentation

This directory contains the High-Level Design (HLD) documentation for the Automated Phone Calls feature.

## Documents

### 1. [HLD-Automated-Phone-Calls.md](./HLD-Automated-Phone-Calls.md)
**Complete High-Level Design Document** (715 lines)

Comprehensive design covering:
- Executive Summary
- Feature Overview & User Workflow
- Architecture Components (Data Models, Backend Services, Frontend Components)
- API Endpoints
- Yemot API Integration (Methods, Authentication, File Storage)
- Design Questions & Alternatives (8 key decision points)
- Implementation Phases (MVP, Enhanced, Advanced)
- Security, Compliance & Data Privacy
- Testing Strategy
- Monitoring & Observability
- Migration & Deployment
- Open Questions for Product Owner (10 questions)
- Dependencies, Risks & Mitigation
- Success Criteria
- Future Enhancements

### 2. [HLD-Summary.md](./HLD-Summary.md)
**Quick Reference Guide**

Condensed version highlighting:
- Key components overview
- Yemot API methods required
- Recommended design decisions
- Implementation phases summary
- Open questions for stakeholders
- Success criteria
- Next steps

### 3. [HLD-Architecture-Diagram.md](./HLD-Architecture-Diagram.md)
**Visual Architecture Documentation**

ASCII diagrams showing:
- System Architecture Overview
- Data Flow Diagrams (Template Creation, Campaign Execution)
- Component Interaction Matrix
- Authentication Flow
- Error Handling Flow
- Deployment Architecture

## Key Terminology

- **Phone Template** / **Phone Message Template**: Reusable configuration for automated phone messages
- **Campaign**: Specific execution instance of a phone template to multiple recipients
- **TTS**: Text-to-Speech, automated voice generation from text
- **Yemot**: Israeli phone system service providing IVR and campaign capabilities

## Technology Stack

- **Frontend**: React 18, React-Admin 5.3, Vite 2.7
- **Backend**: NestJS 9, TypeORM
- **Database**: MySQL
- **External API**: Yemot Phone System (https://www.call2all.co.il/ym/api/)
- **HTTP Client**: Axios (@nestjs/axios)

## Reading Order

1. Start with **HLD-Summary.md** for a quick overview
2. Review **HLD-Architecture-Diagram.md** for visual understanding
3. Read **HLD-Automated-Phone-Calls.md** for complete details

## Implementation Status

📝 **Status**: Design Complete - Awaiting Approval

**Next Steps**:
1. Review HLD with stakeholders
2. Answer open questions (see Section 11 in main HLD)
3. Approve design decisions
4. Create implementation tickets
5. Set up Yemot API test environment
6. Begin Phase 1 (MVP) implementation

## Questions or Feedback

For questions about this design or to provide feedback, please:
1. Review the "Open Questions for Product Owner" section in the main HLD
2. Consider the design alternatives presented for each decision point
3. Provide answers and preferences for implementation

## Related Documentation

- Project Root: `/README.md`
- Project Index: `/project-index.md`
- Agent Workflow: `/AGENTS.md`
- New Project Checklist: `/new-project-checklist.md`

## Document Maintenance

- **Created**: 2026-01-15
- **Last Updated**: 2026-01-15
- **Version**: 1.0
- **Author**: GitHub Copilot Agent
- **Approved By**: [Pending]
