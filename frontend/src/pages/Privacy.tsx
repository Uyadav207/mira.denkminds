import React from "react";
import { Link } from "react-router-dom";



const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 bg-gray-50 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">

      <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Privacy Policy</h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: January 1, 2025</p>
        </div>
        
        <section className="mt-6 space-y-4">
        <p>At denkMinds, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, store, and share your information when you interact with our products, services, and platforms. By using our services, you agree to the practices described in this policy.</p>

        <hr class="my-6 border-gray-300" />

        <h2 className="text-2xl font-bold tracking-tight">Information We Collect</h2>
          <p>We collect information to provide and improve our services. This includes:</p>
          <p className="text-gray-500 dark:text-gray-400"><strong>Information You Provide:</strong></p>
          <ul className="list-disc pl-6">
            <li>Personal details, such as your name and email address, when you register or contact us.</li>
            <li>Feedback, inquiries, or other communications sent to us.</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400"><strong>Automatically Collected Information:</strong></p>
          <ul className="list-disc pl-6">
            <li>Technical data, including IP addresses, browser types, device identifiers, and operating systems.</li>
            <li>Usage data, such as pages visited, time spent on our platform, and interaction patterns.</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400"><strong>Third-Party Information:</strong></p>
          <ul className="list-disc pl-6">
            <li>Data from partners or integrations you authorize, such as CRM tools or analytics platforms.</li>
          </ul>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">How We Use Your Data</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6">
            <li>Provide, customize, and improve our services.</li>
            <li>Communicate with you about updates, new features, or customer support.</li>
            <li>Monitor usage and optimize platform performance.</li>
            <li>Ensure security and prevent fraud.</li>
            <li>Comply with legal obligations.</li>
          </ul>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Sharing Your Data</h2>
          <p>We respect your trust and only share your information:</p>
          <p className="text-gray-500 dark:text-gray-400"><strong>With Your Consent:</strong></p>
          <ul className="list-disc pl-6">
            <li>When you explicitly approve the sharing of specific information.</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400"><strong>With Trusted Third Parties:</strong></p>
          <ul className="list-disc pl-6">
            <li>Service providers that assist in our operations (e.g., hosting, analytics, or email communication).</li>
            <li>Partners in collaborative projects, only with relevant and necessary data.</li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400"><strong>For Legal Reasons:</strong></p>
          <ul className="list-disc pl-6">
            <li>If required by law, regulation, or legal process.</li>
            <li>Partners in collaborative projects, only with relevant and necessary data.</li>
          </ul>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Data Storage and Security</h2>
        <p>We implement industry-standard security measures to protect your data, including encryption, access controls, and regular audits. However, no system is completely secure. While we strive to safeguard your information, we cannot guarantee its absolute security.</p>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Your Rights</h2>
          <p>You have the right to: </p>
          <ul className="list-disc pl-6">
            <li><strong>Access and Update Your Data:</strong> Review or correct inaccuracies in your personal information.</li>

            <li><strong>Request Deletion:</strong> Ask us to delete your data, subject to legal or contractual obligations.</li>

            <li><strong>Withdraw Consent:</strong> Revoke your consent for processing, where applicable.</li>

            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time.</li>
          </ul>
          <p>To exercise these rights, contact us at <strong className="text-gray-500 dark:text-gray-400">denkminds@gmail.com</strong></p>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Cookies & Tracking</h2>
        <p>We use cookies and similar technologies to enhance your experience. You can manage cookie preferences through your browser settings. Disabling cookies may affect the functionality of our services.</p>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">International Users</h2>
        <p>If you access our services from outside Germany, your information may be transferred to and processed in countries with different data protection laws. We ensure such transfers comply with applicable regulations.</p>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Policy Updates</h2>
        <p>We may update this policy periodically to reflect changes in our practices or legal requirements. We will notify you of significant updates and encourage you to review this policy regularly.</p>
        </section>

        <hr class="my-6 border-gray-300" />

        <section className="mt-6 space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Contact Us</h2>
        <p>If you have questions, reach out to us at:</p>
          <ul className="list-disc pl-7">
            <li><p></p>Email: <strong>denkminds@gmail.com</strong></li>
          </ul>
        </section>

        <hr class="my-6 border-gray-300" />

        <p className="text-center text-gray-500 dark:text-gray-400">Thank you for trusting denkMinds with your privacy.</p>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
