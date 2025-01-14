import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import Image from 'next/image';
import "../../../public/Mira_logo.png";

interface MarkdownViewerProps {
	content: string;
}

const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
	return (
		<>
			<style>
				{`
          .pdf-export {
            font-family: 'Open Sans', sans-serif !important;
            line-height: 1.5 !important;
            color: #000 !important;
            
            padding: 20px !important;
            font-size: 12pt !important;
          }
			 .pdf-export .header {
            text-align: center !important;
            margin-bottom: 40px !important;
          }
          
          .pdf-export .logo {
            max-width: 200px !important;
            margin: 0 auto 10px !important;
          }
          
          .pdf-export h1 {
            font-family: 'Open Sans', sans-serif !important;
            font-size: 24pt !important;
            font-weight: bold !important;
            margin: 0 0 16pt 0 !important;
            page-break-after: avoid !important;
			color: linear-gradient(150deg,#7156DB,#272278 23%,#0F0A25 53%,#080115) !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
          }
          
          .pdf-export h2 {
            font-family: 'Open Sans', sans-serif !important;
            font-size: 16pt !important;
            font-weight: bold !important;
            margin: 16pt 0 8pt 0 !important;
            page-break-after: avoid !important;
          }
          
          .pdf-export h3 {
            font-family: 'Open Sans', sans-serif !important;
            font-size: 16pt !important;
            font-weight: bold !important;
            margin: 8pt 0 !important;
            page-break-after: avoid !important;
          }
          
          .pdf-export h4, .pdf-export h5, .pdf-export h6 {
            font-family: 'Open Sans', sans-serif !important;
            font-size: 16pt !important;
            font-weight: bold !important;
            margin: 8pt 0 !important;
            page-break-after: avoid !important;
          }
          
          .pdf-export p {
            margin: 0 0 8pt 0 !important;
            color: #000 !important;
			orphans: 3 !important;
            widows: 3 !important;
          }
          
          .pdf-export ul {
            list-style-type: none !important;
            padding-left: 20pt !important;
            margin: 8pt 0 !important;
			page-break-inside: avoid !important;
          }
          
          .pdf-export ul li:before {
            content: "-> " !important;
            margin-left: -12pt !important;
          }
          
          .pdf-export ol {
            padding-left: 20pt !important;
            margin: 8pt 0 !important;
			page-break-inside: avoid !important;
			list-style-position: outside !important;
  			line-height: 1.6 !important;
          }
  .pdf-export ol li {
  margin: 4pt 0 !important;
   padding-left: 0 !important;
  line-height: 1.5 !important;
  display: list-item !important;
  list-style-position: inside !important;
}
          
          .pdf-export li {
            color: #000 !important;
            margin: 4pt 0 !important;
			page-break-inside: avoid !important;
          }
          
          .pdf-export code {
            font-family: 'Open Sans', sans-serif !important;
            background: none !important;
            padding: 0 !important;
            font-size: 12pt !important;
          }
          
          .pdf-export pre {
            font-family: 'Open Sans', sans-serif !important;
            background: none !important;
            padding: 8pt !important;
            margin: 8pt 0 !important;
            border: none !important;
            font-size: 12pt !important;
			page-break-inside: avoid !important;
          }
          
          .pdf-export blockquote {
            margin: 8pt 0 8pt 20pt !important;
            padding: 0 !important;
            border: none !important;
            font-style: normal !important;
			page-break-inside: avoid !important;
          }
          
          .pdf-export table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 8pt 0 !important;
            font-size: 12pt !important;
			page-break-inside: avoid !important;
          }
          
          .pdf-export th, .pdf-export td {
            border: 1px solid #000 !important;
            padding: 4pt 8pt !important;
            text-align: left !important;
          }
          
          .pdf-export thead {
            background: none !important;
          }
		  /* Keep vulnerability sections together */
          .pdf-export section {
            page-break-inside: avoid !important;
          }

          /* Prevent orphaned headers */
          .pdf-export h1, .pdf-export h2, .pdf-export h3, 
          .pdf-export h4, .pdf-export h5, .pdf-export h6 {
            orphans: 3 !important;
            widows: 3 !important;
          }

          /* Keep lists with their headers */
          .pdf-export h1 + ul, .pdf-export h2 + ul, 
          .pdf-export h3 + ul, .pdf-export h1 + ol, 
          .pdf-export h2 + ol, .pdf-export h3 + ol {
            page-break-before: avoid !important;
          }

          /* Ensure proper spacing without forcing page breaks */
          .pdf-export hr {
            margin: 16pt 0 !important;
            border-color: #000 !important;
          }
          @media print {
            .pdf-export * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
			.pdf-export {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
			</style>
			{/* <div className="pdf-export"> */}
			{/* <div className="header">
				<img src="/Mira_logo.png" alt="Mira Logo" width={100} height={50} />
			</div> */}
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h1: ({ node, ...props }) => (
						<h1 className="text-3xl font-bold mb-4" {...props} />
					),
					h2: ({ node, ...props }) => (
						<h2 className="text-2xl font-semibold mb-3 mt-6" {...props} />
					),
					h3: ({ node, ...props }) => (
						<h3 className="text-xl font-semibold mb-2 mt-4" {...props} />
					),
					h4: ({ node, ...props }) => (
						<h4 className="text-lg font-semibold mb-2 mt-3" {...props} />
					),
					h5: ({ node, ...props }) => (
						<h5 className="text-base font-medium mb-1 mt-2" {...props} />
					),
					h6: ({ node, ...props }) => (
						<h6
							className="text-sm font-medium mb-1 mt-2 text-gray-600 dark:text-gray-400"
							{...props}
						/>
					),
					p: ({ node, ...props }) => (
						<p className="mb-4 text-gray-700 dark:text-gray-300" {...props} />
					),
					ul: ({ node, ...props }) => (
						<ul className="list-disc pl-6 mb-4" {...props} />
					),
					ol: ({ node, ...props }) => (
						<ol className="list-decimal pl-6 mb-4" {...props} />
					),
					li: ({ node, ...props }) => (
						<li className="mb-1 text-gray-700 dark:text-gray-300" {...props} />
					),
					hr: ({ node, ...props }) => (
						<hr
							className="my-6 border-gray-200 dark:border-gray-700"
							{...props}
						/>
					),
					code: ({ node, className, children, ...props }) => {
						return (
							<code
								className="px-1 py-0.5 rounded-md bg-secondary text-sm"
								{...props}
							>
								{children}
							</code>
						);
					},
					strong: ({ node, ...props }) => (
						<strong className="font-semibold" {...props} />
					),
					em: ({ node, ...props }) => <em className="italic" {...props} />,
					blockquote: ({ node, ...props }) => (
						<blockquote className="border-l-4  pl-4 italic my-4" {...props} />
					),
					a: ({ href, children, ...props }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 hover:underline"
							{...props}
						>
							{children}
						</a>
					),
					// img: ({ src, alt, ...props }) => (
					// 	<img
					// 		src={src}
					// 		alt={alt}
					// 		className="max-w-full h-auto rounded-md"
					// 		{...props}
					// 	/>
					// ),
					table: ({ children }) => (
						<table className="table-auto border-collapse border border-gray-300 w-full">
							{children}
						</table>
					),
					thead: ({ children }) => (
						<thead className="bg-gray-200">{children}</thead>
					),
					tbody: ({ children }) => (
						<tbody className="divide-y divide-gray-200">{children}</tbody>
					),
					tr: ({ children }) => (
						<tr className="border-b border-gray-300">{children}</tr>
					),
					th: ({ children }) => (
						<th className="px-4 py-2 text-left font-semibold text-gray-700">
							{children}
						</th>
					),
					td: ({ children }) => (
						<td className="px-4 py-2 text-gray-600">{children}</td>
					),
					del: ({ node, ...props }) => (
						<del className="line-through" {...props} />
					),
					pre: ({ children, ...props }) => (
						<pre
							className="p-4 overflow-auto rounded-md bg-secondary"
							{...props}
						>
							{children}
						</pre>
					),
					br: () => <br />,
				}}
			>
				{content}
			</ReactMarkdown>
			{/* </div> */}
		</>
	);
};

export default MarkdownViewer;
