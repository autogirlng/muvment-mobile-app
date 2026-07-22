import React from "react";

import { LegalDocumentScreen } from "../src/components/legal/LegalDocumentScreen";
import { termsOfUseDocument } from "../src/constants/legalDocuments";

export default function TermsOfUseScreen() {
  return (
    <LegalDocumentScreen
      body={termsOfUseDocument.body}
      title={termsOfUseDocument.title}
    />
  );
}
