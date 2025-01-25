import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
  } from "../components/ui/accordion"
  
  export function FAQs() {
	return (
	  <Accordion type="single" collapsible className="w-full">
		<AccordionItem value="item-1">
		  <AccordionTrigger>How does MIRA ensure data security while performing scans?</AccordionTrigger>
		  <AccordionContent>
		  MIRA uses trusted external tools like ZAP and SonarQUBE with secure API keys. All data is processed securely and is not shared with third parties, ensuring complete confidentiality of your application data.
		  </AccordionContent>
		</AccordionItem>
		<AccordionItem value="item-2">
		  <AccordionTrigger>What are the types of scans supported by MIRA? </AccordionTrigger>
		  <AccordionContent>
		  MIRA supports both Passive Scans (low-impact scans for quick vulnerability checks) and Active Scans (comprehensive scans for deeper vulnerability detection). Users can choose based on their specific requirements.
		  </AccordionContent>
		</AccordionItem>
		<AccordionItem value="item-3">
		  <AccordionTrigger>How do I generate a report?		  </AccordionTrigger>
		  <AccordionContent>
		  To generate a report, go to the "Reports" section from the navigation menu. Select the type of report you want to generate, specify the date range and other parameters, and click "Generate Report". The report will be displayed on the screen and can be downloaded in PDF format.
		  </AccordionContent>
		  </AccordionItem>
		  <AccordionItem value="item-4">
		  <AccordionTrigger>what features does mira chatbot provide?		  </AccordionTrigger>
		  <AccordionContent>
		  The MIRA chatbot in the Cybersecurity AI Assessment project provides features such as conducting cybersecurity assessments, generating detailed reports (e.g., Chat Summary Report and Vulnerability Report), offering user guidance and security recommendations, and scanning websites to identify potential vulnerabilities.
		  </AccordionContent>
		  </AccordionItem>
		  <AccordionItem value="item-5">
		  <AccordionTrigger>who is MIRA		  </AccordionTrigger>
		  <AccordionContent>
		  MIRA is an AI-driven chatbot designed to support developers by offering real-time guidance, security risk assessments, compliance insights, and code improvement suggestions. It helps streamline workflows, ensures secure development, and enhances productivity.
		  </AccordionContent>
		  </AccordionItem>
		  
	  </Accordion>
	)
  }
  