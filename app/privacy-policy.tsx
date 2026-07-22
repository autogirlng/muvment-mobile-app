import React from "react";

import { LegalDocumentScreen } from "../src/components/legal/LegalDocumentScreen";
import { privacyPolicyDocument } from "../src/constants/legalDocuments";

export default function PrivacyPolicyScreen() {
  return (
    <LegalDocumentScreen
      body={privacyPolicyDocument.body}
      title={privacyPolicyDocument.title}
    />
  );
}
