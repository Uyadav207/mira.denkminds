import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import type { Folder } from "../../types/reports";
import { TemplateCard } from "../PDF/templatecard";
import { Vulnerability } from "../scans/Vulnerability";
import { useParams, useNavigate } from "react-router-dom";

interface FolderViewProps {
  folder: Folder;
  onBack: () => void;
}

export function FolderView({ folder, onBack }: FolderViewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const navigate = useNavigate();

//   const handlePrint = useReactToPrint({
//     contentRef: templateRef,
//     documentTitle: selectedTemplate || "Template",
//     onBeforePrint: () => {
//       setIsPrinting(true);
//       return Promise.resolve();
//     },
//     onAfterPrint: () => {
//       setIsPrinting(false);
//       setSelectedTemplate(null); // Reset after printing
//     },
//   });


//   const handleDownload = async (template: string) => {
//     setSelectedTemplate(template);
// 	setIsPrinting(false);
//     // Ensure the state is set before triggering the print
//     setTimeout(() => {
//       if (handlePrint) {
//         handlePrint();
//       }
//     }, 100);
//   };
  const handleView = (template: string) => {
    // Navigate to the printtemplate page with the selected template
    navigate(`/printtemplate?template=${encodeURIComponent(template)}`);
  };
  


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{folder.name}</h2>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Folders
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {["Template 1", "Template 2", "Template 3"].map((template, index) => (
          <TemplateCard
            key={index}
            title={template}
            content={`This is the content of ${template.toLowerCase()}`}
            onClick={() => handleView(template)}
            // onDownload={() => handleDownload(template)}
          />
        ))}
      </div>
      {/* <Dialog open={!!selectedTemplate && !isPrinting} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate}</DialogTitle>
          </DialogHeader>
          <div>
            {selectedTemplate && <Vulnerability templateId={selectedTemplate} />}
          </div>
        </DialogContent>
      </Dialog> */}
      <div style={{ display: "none" }}>
        <div ref={templateRef}>
          {selectedTemplate && <div>{selectedTemplate} content for printing</div>}
        </div>
      </div>
    </div>
  );
}
