// import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card"
import { Button } from "../components/ui/button"
import { Code, FileText, Globe, Radar, Shield, Zap } from "lucide-react"

export function FAQs() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 pb-4">
      <Card className="w-full max-w-3xl min-h-[50vh]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              
			  <AccordionTrigger>Who is MIRA?</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* <Image src="/placeholder.svg?height=200&width=300" alt="MIRA AI" width={300} height={200} /> */}
                  <p>
                    MIRA is an AI-driven chatbot designed to support developers by offering real-time guidance, security
                    risk assessments, compliance insights, and code improvement suggestions. It helps streamline
                    workflows, ensures secure development, and enhances productivity.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              
			<AccordionTrigger>What features does MIRA chatbot provide?</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-center mb-2">
                    The MIRA chatbot in the Cybersecurity AI Assessment project provides the following key features:
                  </p>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 py-0 px-3 flex items-center justify-start space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Generate Reports</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 py-0 px-3 flex items-center justify-start space-x-2 bg-green-100 hover:bg-green-200 text-green-800"
                    >
                      <Zap className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Dynamic Scans</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 py-0 px-3 flex items-center justify-start space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-800"
                    >
                      <Code className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Static Scans</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 py-0 px-3 flex items-center justify-start space-x-2 bg-orange-100 hover:bg-orange-200 text-orange-800"
                    >
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Scan Websites</span>
                    </Button>
                  </div>
                  <p className="text-center mt-2 text-sm">
                    These features enable MIRA to conduct comprehensive cybersecurity assessments, offer user guidance,
                    and provide security recommendations tailored to your specific needs.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
			<AccordionTrigger>What are the types of scans supported by MIRA?</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-center mb-2">MIRA supports two main types of scans:</p>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 py-0 px-3 flex items-center justify-start space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800"
                    >
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Passive Scans</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 py-0 px-3 flex items-center justify-start space-x-2 bg-green-100 hover:bg-green-200 text-green-800"
                    >
                      <Radar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs font-semibold">Active Scans</span>
                    </Button>
                  </div>
                  <p className="text-sm mt-2">
                    Passive Scans are low-impact scans for quick vulnerability checks, while Active Scans are
                    comprehensive scans for deeper vulnerability detection. Users can choose based on their specific
                    requirements.
                  </p>
                </div>
              </AccordionContent>
              
            </AccordionItem>
            <AccordionItem value="item-4">
			<AccordionTrigger>How do I generate a report?</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* <Image src="/placeholder.svg?height=200&width=300" alt="Report Generation" width={300} height={200} /> */}
                  <p>
                    To generate a report, go to the "Reports" section from the navigation menu. Select the type of
                    report you want to generate, specify the date range and other parameters, and click "Generate
                    Report". The report will be displayed on the screen and can be downloaded in PDF format.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
			<AccordionTrigger>How does MIRA ensure data security while performing scans?</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* <Image src="/placeholder.svg?height=200&width=300" alt="Data Security" width={300} height={200} /> */}
                  <p>
                    MIRA uses trusted external tools like ZAP and SonarQUBE with secure API keys. All data is processed
                    securely and is not shared with third parties, ensuring complete confidentiality of your application
                    data.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

