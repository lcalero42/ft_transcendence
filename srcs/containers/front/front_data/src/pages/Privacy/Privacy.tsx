import LegalLayout from "@/components/LegalLayout/LegalLayout";
import { LAST_UPDATED, privacySections } from "./privacyContent";

function Privacy() {
	return <LegalLayout title="Privacy Policy" lastUpdated={LAST_UPDATED} sections={privacySections} />;
}

export default Privacy;
