import Link from "next/link";
import AnimationContainer from "../_components/global/animation-container";
import MaxWidthWrapper from "../_components/global/max-widht-wrapper";

const TermsPage = () => {
	return (
		<MaxWidthWrapper className="max-w-3xl mx-auto px-8 mb-40">
			<AnimationContainer delay={0.1} className="w-full">
				<h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center w-full">
					Terms of Service
				</h1>
				<p className="text-sm mb-2 italic mt-20">
					Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
				</p>
				<p className="mt-4">
					Welcome to <strong>Fuzed</strong>. These Terms of Service ("Terms") govern your access to and use of our
					AI-powered face matching platform, including all features such as celebrity matching, AI baby generation,
					and real-time chat. By using Fuzed, you agree to be bound by these Terms.
				</p>

				<h2 className="text-xl font-medium mt-8">1. Acceptance of Terms</h2>

				<p className="mt-8 text-muted-foreground">
					By accessing, browsing, or using Fuzed, you acknowledge that you have read, understood, and agree to be
					bound by these Terms and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
					If you do not agree to these Terms, you must not use our platform.
				</p>

				<h2 className="text-xl font-medium mt-12">2. Eligibility</h2>
				<p className="mt-8 text-muted-foreground">
					You must be at least 18 years old to use Fuzed. By using our platform, you represent and warrant that:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>You are at least 18 years of age</li>
					<li>You have the legal capacity to enter into a binding contract</li>
					<li>You are not prohibited from using our services under any applicable laws</li>
					<li>All information you provide is accurate and truthful</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">3. Account Registration and Security</h2>

				<h3 className="text-lg mt-8">Account Creation</h3>
				<p className="mt-8 text-muted-foreground">
					To use Fuzed, you must create an account. You agree to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Provide accurate, current, and complete information during registration</li>
					<li>Maintain and promptly update your account information</li>
					<li>Keep your password secure and confidential</li>
					<li>Accept responsibility for all activities under your account</li>
					<li>Notify us immediately of any unauthorized access or security breach</li>
				</ul>

				<h3 className="text-lg mt-8">Account Termination</h3>
				<p className="mt-8 text-muted-foreground">
					We reserve the right to suspend or terminate your account at any time for:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Violation of these Terms</li>
					<li>Fraudulent or illegal activity</li>
					<li>Abuse of platform features or other users</li>
					<li>Providing false or misleading information</li>
					<li>Any other reason at our sole discretion</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">4. Photo Upload and Facial Data</h2>

				<h3 className="text-lg mt-8">Photo Requirements</h3>
				<p className="mt-8 text-muted-foreground">
					When uploading photos to Fuzed, you agree that:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>You own the rights to all photos you upload</li>
					<li>Photos must clearly show your face</li>
					<li>Photos must not contain nudity, violence, or offensive content</li>
					<li>Photos must not violate any third-party rights or privacy</li>
					<li>You grant us permission to process and analyze your facial data for matching purposes</li>
				</ul>

				<h3 className="text-lg mt-8">Consent to Facial Recognition</h3>
				<p className="mt-8 text-muted-foreground">
					By uploading photos, you explicitly consent to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Processing of your facial biometric data using InsightFace AI</li>
					<li>Extraction and storage of 512-dimensional facial embeddings</li>
					<li>Analysis of facial attributes (age, gender, pose, quality, etc.)</li>
					<li>Comparison of your facial features with other users and celebrities</li>
					<li>Display of your photos to other users in match results</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">5. Platform Features and Usage</h2>

				<h3 className="text-lg mt-8">Face Matching</h3>
				<p className="mt-8 text-muted-foreground">
					Our face matching service uses AI to find users with similar facial features. You understand that:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Matching is based on algorithmic analysis and may not be perfect</li>
					<li>Similarity scores are estimates and not guarantees</li>
					<li>Match results depend on photo quality and available users</li>
					<li>We do not guarantee specific matching outcomes</li>
				</ul>

				<h3 className="text-lg mt-8">AI Baby Generation</h3>
				<p className="mt-8 text-muted-foreground">
					The AI baby generator creates predictions using FAL.AI technology. You acknowledge that:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Generated images are artistic predictions, not accurate forecasts</li>
					<li>Results are for entertainment purposes only</li>
					<li>Generated babies are stored and visible to both users involved</li>
					<li>Generating a baby with a match unlocks mutual chat capability</li>
				</ul>

				<h3 className="text-lg mt-8">Chat and Communication</h3>
				<p className="mt-8 text-muted-foreground">
					Our platform includes real-time chat functionality. When using chat, you agree to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Communicate respectfully and appropriately</li>
					<li>Not harass, threaten, or abuse other users</li>
					<li>Not share explicit or inappropriate content</li>
					<li>Not solicit personal information outside the platform</li>
					<li>Report any abusive behavior immediately</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">6. Prohibited Conduct</h2>
				<p className="mt-8 text-muted-foreground">
					You may NOT use Fuzed to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Upload photos of other people without their consent</li>
					<li>Impersonate another person or entity</li>
					<li>Harass, stalk, or intimidate other users</li>
					<li>Upload illegal, offensive, or inappropriate content</li>
					<li>Attempt to reverse engineer our AI algorithms</li>
					<li>Scrape, crawl, or collect data from the platform</li>
					<li>Interfere with platform security or operations</li>
					<li>Create multiple accounts for fraudulent purposes</li>
					<li>Use the platform for commercial purposes without authorization</li>
					<li>Violate any applicable laws or regulations</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">7. Intellectual Property Rights</h2>

				<h3 className="text-lg mt-8">Our Content</h3>
				<p className="mt-8 text-muted-foreground">
					All content on Fuzed, including design, text, graphics, logos, algorithms, and software, is owned by us
					or our licensors and is protected by intellectual property laws. You may not copy, modify, distribute,
					or create derivative works without our written permission.
				</p>

				<h3 className="text-lg mt-8">Your Content</h3>
				<p className="mt-8 text-muted-foreground">
					You retain ownership of the photos you upload. By uploading content, you grant us a worldwide,
					non-exclusive, royalty-free license to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Display your photos to other users in match results</li>
					<li>Process and analyze your facial data for matching</li>
					<li>Generate AI baby images using your photos</li>
					<li>Use aggregated, non-identifiable data for research and improvement</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">8. Disclaimers and Limitations</h2>

				<h3 className="text-lg mt-8">No Warranty</h3>
				<p className="mt-8 text-muted-foreground">
					Fuzed is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied.
					We do not guarantee that:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>The platform will be error-free or uninterrupted</li>
					<li>Matching results will be accurate or satisfactory</li>
					<li>You will find compatible matches</li>
					<li>AI-generated content will meet your expectations</li>
					<li>User-provided information is accurate or truthful</li>
				</ul>

				<h3 className="text-lg mt-8">Limitation of Liability</h3>
				<p className="mt-8 text-muted-foreground">
					To the fullest extent permitted by law, Fuzed and its affiliates, officers, employees, and agents shall
					not be liable for any indirect, incidental, special, consequential, or punitive damages, including but
					not limited to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Loss of profits, data, or use</li>
					<li>Personal injury or emotional distress</li>
					<li>Damages resulting from user interactions</li>
					<li>Unauthorized access to or use of your data</li>
					<li>Any other damages arising from use of the platform</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">9. Third-Party Services</h2>
				<p className="mt-8 text-muted-foreground">
					Fuzed integrates with third-party services including:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li><strong>Supabase</strong> - for authentication, storage, and database</li>
					<li><strong>InsightFace AI</strong> - for facial recognition and analysis</li>
					<li><strong>FAL.AI</strong> - for AI baby image generation</li>
				</ul>
				<p className="mt-4 text-muted-foreground">
					Your use of these services is subject to their respective terms and privacy policies. We are not
					responsible for any third-party services or their performance.
				</p>

				<h2 className="text-xl font-medium mt-12">10. Privacy and Data Protection</h2>
				<p className="mt-8 text-muted-foreground">
					Your use of Fuzed is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
					which explains how we collect, use, and protect your personal information and facial data. Please review
					it carefully to understand our privacy practices.
				</p>

				<h2 className="text-xl font-medium mt-12">11. Indemnification</h2>
				<p className="mt-8 text-muted-foreground">
					You agree to indemnify, defend, and hold harmless Fuzed and its affiliates from any claims, liabilities,
					damages, losses, and expenses (including legal fees) arising from:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Your violation of these Terms</li>
					<li>Your use of the platform</li>
					<li>Your content or photos</li>
					<li>Your interactions with other users</li>
					<li>Any infringement of third-party rights</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">12. Dispute Resolution</h2>

				<h3 className="text-lg mt-8">Governing Law</h3>
				<p className="mt-8 text-muted-foreground">
					These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
					without regard to its conflict of law provisions.
				</p>

				<h3 className="text-lg mt-8">Arbitration</h3>
				<p className="mt-8 text-muted-foreground">
					Any disputes arising from these Terms or your use of Fuzed shall be resolved through binding arbitration,
					except where prohibited by law. You waive your right to participate in class action lawsuits.
				</p>

				<h2 className="text-xl font-medium mt-12">13. Changes to Terms</h2>
				<p className="mt-8 text-muted-foreground">
					We reserve the right to modify these Terms at any time. We will notify you of material changes by:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Updating the "Last updated" date at the top of this page</li>
					<li>Posting a notice on the platform</li>
					<li>Sending an email notification (if applicable)</li>
				</ul>
				<p className="mt-4 text-muted-foreground">
					Your continued use of Fuzed after changes constitutes acceptance of the modified Terms.
				</p>

				<h2 className="text-xl font-medium mt-12">14. Termination</h2>
				<p className="mt-8 text-muted-foreground">
					You may terminate your account at any time through profile settings. Upon termination:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Your photos and facial embeddings will be permanently deleted</li>
					<li>Your profile and matches will be removed</li>
					<li>Your chat history will be deleted</li>
					<li>You will lose access to all platform features</li>
				</ul>
				<p className="mt-4 text-muted-foreground">
					We may retain some information as required by law or for legitimate business purposes.
				</p>

				<h2 className="text-xl font-medium mt-12">15. General Provisions</h2>

				<h3 className="text-lg mt-8">Entire Agreement</h3>
				<p className="mt-8 text-muted-foreground">
					These Terms, together with our Privacy Policy, constitute the entire agreement between you and Fuzed.
				</p>

				<h3 className="text-lg mt-8">Severability</h3>
				<p className="mt-8 text-muted-foreground">
					If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions
					shall remain in full force and effect.
				</p>

				<h3 className="text-lg mt-8">No Waiver</h3>
				<p className="mt-8 text-muted-foreground">
					Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such
					right or provision.
				</p>

				<h2 className="text-xl font-medium mt-12">16. Contact Information</h2>
				<p className="mt-8 text-muted-foreground">
					If you have any questions about these Terms, please contact us at:
				</p>
				<p className="mt-4 text-muted-foreground">
					Email: legal@fuzed.app
				</p>

				<p className="mt-12 p-6 bg-muted/20 rounded-lg border border-border">
					<strong>By using Fuzed, you acknowledge that you have read, understood, and agree to be bound by these
					Terms of Service. If you do not agree to these Terms, you must not use our platform.</strong>
				</p>
			</AnimationContainer>
		</MaxWidthWrapper>
	);
};

export default TermsPage;
