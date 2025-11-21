export const FAQ = [
	{
		id: "item-1",
		question: "How does the AI face matching work?",
		answer:
			"Our AI uses InsightFace technology to extract 512-dimensional facial embeddings from your photos. These embeddings capture unique facial features, which are then compared using cosine similarity to find your best matches based on facial similarity.",
	},
	{
		id: "item-2",
		question: "Is my photo data secure and private?",
		answer:
			"Yes! Your photos are securely stored in Supabase Storage with industry-standard encryption. Your face data is never shared without your permission, and all matching is done anonymously until both users express mutual interest by generating a baby.",
	},
	{
		id: "item-3",
		question: "What is the AI baby generation feature?",
		answer:
			"The AI baby generator uses advanced AI models (FAL.AI) to create a realistic prediction of what a baby might look like based on the facial features of two matched users. It's a fun conversation starter and unlocks the ability to chat with your match!",
	},
	{
		id: "item-4",
		question: "How do I unlock chat with a match?",
		answer:
			"Chat is unlocked when both you and your match generate a baby with each other. This ensures mutual interest before enabling direct messaging. Once unlocked, you'll get AI-generated conversation starters to help break the ice.",
	},
	{
		id: "item-5",
		question: "What kind of photos should I upload?",
		answer:
			"For best results, upload clear, well-lit photos where your face is visible and looking at the camera. Avoid sunglasses, heavy filters, or obscured faces. You can upload multiple photos and select which one to use for matching.",
	},
	{
		id: "item-6",
		question: "How accurate is the celebrity matching?",
		answer:
			"Our celebrity matching uses the same advanced AI face analysis as user matching. While it's quite accurate, results are meant to be fun and engaging! Similarity scores show how closely your facial features align with each celebrity.",
	},
	{
		id: "item-7",
		question: "Is the app completely free?",
		answer:
			"Yes! The app is currently completely free to use. You can upload photos, find matches, generate AI babies, and chat with your matches at no cost.",
	},
	{
		id: "item-8",
		question: "Can I delete my photos and data?",
		answer:
			"Absolutely! You have full control over your data. You can delete your uploaded photos and account at any time through your profile settings. All associated face embeddings and generated content will be permanently removed.",
	},
	{
		id: "item-9",
		question: "How are matches calculated?",
		answer:
			"Matches are calculated using cosine similarity between facial embeddings. The algorithm considers facial geometry, features, and attributes. Higher similarity scores indicate closer facial resemblance. The system also factors in photo quality for more accurate matching.",
	},
	{
		id: "item-10",
		question: "Can I see who I matched with before they see me?",
		answer:
			"Yes! You can browse all your matches and their similarity scores. However, chat is only unlocked when both users show mutual interest by generating a baby together, ensuring a privacy-first approach to connections.",
	},
];
