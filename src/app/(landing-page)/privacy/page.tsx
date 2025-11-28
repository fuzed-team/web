import AnimationContainer from "../_components/global/animation-container";
import MaxWidthWrapper from "../_components/global/max-widht-wrapper";

const Privacy = () => {
	return (
		<MaxWidthWrapper className="max-w-3xl mx-auto px-8 mb-40">
			<AnimationContainer delay={0.1} className="w-full">
				<h1 className="text-4xl md:text-6xl font-heading font-bold my-12 text-center w-full">
					Privacy Policy
				</h1>
				<p className="text-sm mb-2 italic mt-20">
					Last updated:{" "}
					{new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</p>
				<p className="mt-4">
					At <strong>Fuzed</strong>, we are committed to protecting your privacy
					and safeguarding your personal information, including facial data.
					This Privacy Policy explains how we collect, use, disclose, and
					safeguard your information when you use our AI face matching platform.
				</p>

				<h2 className="text-xl font-medium mt-8">Information We Collect</h2>

				<h3 className="text-lg mt-4">Personal Information</h3>
				<p className="mt-8 text-muted-foreground">
					When you register for an account or use our services, we collect
					personal information including your name, email address,
					school/university affiliation, gender, and profile photos. We also
					store your account preferences and settings.
				</p>

				<h3 className="text-lg font-medium mt-12">
					Facial Data and Biometric Information
				</h3>
				<p className="mt-8 text-muted-foreground">
					When you upload photos to our platform, we process your facial images
					to extract facial embeddings (512-dimensional vectors) using
					InsightFace AI technology. These embeddings are mathematical
					representations of your facial features used for matching purposes. We
					also analyze facial attributes such as landmarks, pose, quality
					scores, age estimation, and expression detection. Your original photos
					are securely stored in Supabase Storage.
				</p>

				<h3 className="text-lg font-medium mt-12">Usage Data</h3>
				<p className="mt-8 text-muted-foreground">
					We collect information about your interactions with our platform,
					including:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Face matches you view and similarity scores</li>
					<li>Celebrity matches you discover</li>
					<li>AI baby generations you create</li>
					<li>Chat messages with matched users</li>
					<li>Login times and device information</li>
					<li>Browser type, IP address, and technical data</li>
				</ul>

				<h3 className="text-lg font-medium mt-8">
					Cookies and Tracking Technologies
				</h3>
				<p className="mt-8">
					We use cookies and similar tracking technologies to maintain your
					session, remember your preferences, and analyze platform usage. You
					can manage your cookie preferences through your browser settings.
				</p>

				<h2 className="text-xl font-medium mt-12">
					How We Use Your Information
				</h2>

				<h3 className="text-lg mt-8">Core AI Matching Services</h3>
				<div className="mt-8">
					We use your facial data and embeddings to:
					<ul className="list-disc ml-8 text-muted-foreground">
						<li>Find and rank your face matches based on similarity</li>
						<li>Match you with celebrity lookalikes</li>
						<li>Generate AI baby predictions with your matches</li>
						<li>Ensure photo quality and detect multiple faces</li>
						<li>Improve matching accuracy and algorithm performance</li>
					</ul>
				</div>

				<h3 className="text-xl font-medium mt-12">Platform Operations</h3>
				<div className="mt-8">
					We use your information to:
					<ul className="list-disc text-muted-foreground ml-8">
						<li>Provide, operate, and maintain our AI matching platform</li>
						<li>Enable real-time chat between mutually interested users</li>
						<li>Send notifications about new matches and messages</li>
						<li>Process and manage your account</li>
						<li>Respond to support requests and inquiries</li>
						<li>Prevent fraud, abuse, and ensure platform safety</li>
					</ul>
				</div>

				<h3 className="text-lg mt-8">Analytics and Improvement</h3>
				<div className="mt-8">
					We use aggregated, non-identifiable data for:
					<ul className="list-disc text-muted-foreground ml-8">
						<li>Monitoring platform usage and performance</li>
						<li>Improving AI matching algorithms</li>
						<li>Researching and developing new features</li>
						<li>Understanding user preferences and trends</li>
					</ul>
				</div>

				<h2 className="text-xl font-medium mt-12">
					How We Share Your Information
				</h2>

				<h3 className="text-lg mt-8">With Other Users</h3>
				<p className="mt-8 text-muted-foreground">
					Your profile information and photos are visible to other users when
					you appear in their match results. However, facial embeddings are
					never shared. Chat is only unlocked when both users show mutual
					interest by generating an AI baby together, ensuring privacy-first
					connections.
				</p>

				<h3 className="text-lg mt-8">AI Service Providers</h3>
				<p className="mt-8 text-muted-foreground">
					We share facial images with trusted AI providers:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>
						<strong>InsightFace AI</strong> - for facial embedding extraction
						and analysis
					</li>
					<li>
						<strong>FAL.AI</strong> - for AI baby image generation
					</li>
				</ul>
				<p className="mt-4 text-muted-foreground">
					These providers process your data solely for the services we offer and
					do not retain your images.
				</p>

				<h3 className="text-lg mt-8">Infrastructure Providers</h3>
				<p className="mt-8 text-muted-foreground">
					We use <strong>Supabase</strong> for secure data storage,
					authentication, and real-time features. Your photos and data are
					stored with industry-standard encryption and access controls.
				</p>

				<h3 className="text-lg mt-8">Legal Requirements</h3>
				<p className="mt-8 text-muted-foreground">
					We may disclose your information if required to do so by law, to
					protect our rights, prevent fraud, or respond to valid requests by
					public authorities.
				</p>

				<h2 className="text-xl font-medium mt-12">Data Security</h2>
				<p className="mt-8 text-muted-foreground">
					We implement comprehensive security measures to protect your facial
					data and personal information:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>End-to-end encryption for data transmission</li>
					<li>
						Secure storage with Supabase's enterprise-grade infrastructure
					</li>
					<li>Access controls and authentication via Supabase JWT tokens</li>
					<li>Regular security audits and monitoring</li>
					<li>Facial embeddings stored separately from photos</li>
				</ul>
				<p className="mt-4 text-muted-foreground">
					However, no method of transmission over the internet is 100% secure.
					While we strive to protect your data, we cannot guarantee absolute
					security.
				</p>

				<h2 className="text-xl font-medium mt-12">Data Retention</h2>
				<p className="mt-8 text-muted-foreground">
					We retain your personal information, photos, and facial embeddings for
					as long as your account remains active. If you delete your account, we
					will permanently delete:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Your uploaded photos from Supabase Storage</li>
					<li>Your facial embeddings and analysis data</li>
					<li>Your profile information and preferences</li>
					<li>Your chat history and generated baby images</li>
				</ul>
				<p className="mt-4 text-muted-foreground">
					Some anonymized, aggregated data may be retained for analytics and
					research purposes.
				</p>

				<h2 className="text-xl font-medium mt-12">Your Rights and Choices</h2>

				<h3 className="text-lg mt-8">Access and Update</h3>
				<p className="mt-8 text-muted-foreground">
					You have the right to access, view, and update your personal
					information and photos. You can manage your profile, upload new
					photos, or select which photo to use for matching through your account
					settings.
				</p>

				<h3 className="text-lg mt-8">Photo Management</h3>
				<p className="mt-8 text-muted-foreground">
					You can upload, delete, or change your default matching photo at any
					time. Deleting a photo will also remove its associated facial
					embeddings from our system.
				</p>

				<h3 className="text-lg mt-8">Data Deletion</h3>
				<p className="mt-8 text-muted-foreground">
					You have the right to request complete deletion of your account and
					all associated data, including photos and facial embeddings. This
					action is permanent and cannot be undone. You can delete your account
					through profile settings or contact us for assistance.
				</p>

				<h3 className="text-lg mt-8">Opt-Out of Features</h3>
				<p className="mt-8 text-muted-foreground">
					You can choose not to participate in certain features like celebrity
					matching or baby generation. However, core face matching is required
					to use the platform.
				</p>

				<h2 className="text-xl font-medium mt-12">Biometric Privacy</h2>
				<p className="mt-8 text-muted-foreground">
					We recognize the sensitive nature of facial biometric data. We commit
					to:
				</p>
				<ul className="list-disc ml-8 text-muted-foreground mt-4">
					<li>Only collecting facial data necessary for matching services</li>
					<li>
						Never selling or sharing your facial embeddings with third parties
					</li>
					<li>Providing clear disclosure about how facial data is used</li>
					<li>Obtaining explicit consent before processing your photos</li>
					<li>Allowing you to delete your biometric data at any time</li>
					<li>Storing facial embeddings securely and separately from photos</li>
				</ul>

				<h2 className="text-xl font-medium mt-12">Children&apos;s Privacy</h2>
				<p className="mt-8 text-muted-foreground">
					Our services are intended for users aged 18 and above. We do not
					knowingly collect facial data or personal information from individuals
					under 18. If we become aware that we have collected data from someone
					under 18, we will immediately delete all associated information,
					photos, and facial embeddings.
				</p>

				<h2 className="text-xl font-medium mt-12">
					International Data Transfers
				</h2>
				<p className="mt-8 text-muted-foreground">
					Your information may be transferred to and processed in countries
					other than your own. We ensure appropriate safeguards are in place to
					protect your personal information and facial data when transferred
					across borders, in compliance with applicable data protection laws.
				</p>

				<h2 className="text-xl font-medium mt-12">
					Changes to This Privacy Policy
				</h2>
				<p className="mt-8 text-muted-foreground">
					We may update this Privacy Policy from time to time to reflect changes
					in our practices or legal requirements. We will notify you of material
					changes by posting the new Privacy Policy on our platform and updating
					the "Last updated" date at the top. Your continued use of the platform
					after changes constitutes acceptance of the updated policy.
				</p>

				<h2 className="text-xl font-medium mt-12">Contact Us</h2>
				<p className="mt-8 text-muted-foreground">
					If you have any questions, concerns, or requests regarding this
					Privacy Policy or how we handle your facial data and personal
					information, please contact us at:
				</p>
				<p className="mt-4 text-muted-foreground">Email: privacy@fuzed.app</p>

				<p className="mt-8 font-medium">
					By using Fuzed, you acknowledge that you have read, understood, and
					agree to the terms of this Privacy Policy, including our collection
					and processing of your facial biometric data for AI matching purposes.
				</p>
			</AnimationContainer>
		</MaxWidthWrapper>
	);
};

export default Privacy;
