export type FaceFeatures = {
	skin_tone_lab: number[] | null;
	geometry_ratios: Record<string, number> | null;
	expression: string | null;
	age: number | null;
	gender: string | null;
	id?: string;
};

// Skin tone mapping based on L value (Lightness)
export const getSkinToneDescription = (lab: number[] | null): string => {
	if (!lab || lab.length < 1) return "";

	const L = lab[0]; // Lightness
	// a and b axes not used for basic classification currently

	if (L > 75) return "fair skin tone";
	if (L > 65) return "light skin tone";
	if (L > 55) return "medium skin tone";
	if (L > 45) return "tan olive skin tone";
	if (L > 35) return "brown skin tone";
	return "deep dark brown skin tone";
};

// Helper to blend skin tones if they are very different
export const getBlendedSkinTone = (
	labA: number[] | null,
	labB: number[] | null,
): string => {
	if (!labA && !labB) return "natural skin tone";
	if (!labA) return getSkinToneDescription(labB);
	if (!labB) return getSkinToneDescription(labA);

	// Average only the L value for description mapping
	const avgL = (labA[0] + labB[0]) / 2;
	return getSkinToneDescription([avgL, 0, 0]);
};

// Facial geometry interpretation
export const getFaceShapeDescription = (
	ratios: Record<string, number> | null,
): string => {
	if (!ratios) return "";

	const widthHeightRatio = ratios.face_width_height_ratio;
	if (!widthHeightRatio) return "";

	// Typical ranges: < 0.75 (long/oval), > 0.85 (round/square)
	if (widthHeightRatio > 0.82) return "round cute face shape";
	if (widthHeightRatio < 0.75) return "oval face shape";

	return "";
};

export const getEyeDescription = (
	ratios: Record<string, number> | null,
): string => {
	if (!ratios) return "";

	const eyeSpacing = ratios.eye_spacing_face_width;
	if (!eyeSpacing) return "";

	// Typical: ~0.42 is average
	if (eyeSpacing > 0.46) return "wide-set expressive eyes";
	if (eyeSpacing < 0.38) return ""; // close-set usually doesn't need calling out for babies

	return "large expressive eyes";
};

// Variety generators
const getRandomElement = <T>(arr: T[]): T =>
	arr[Math.floor(Math.random() * arr.length)];

export const getRandomAge = (): string => {
	const ages = ["3-month-old", "6-month-old", "9-month-old", "1-year-old"];
	return getRandomElement(ages);
};

export const getRandomExpression = (
	parentExpression?: string | null,
): string => {
	const happyExpressions = [
		"smiling",
		"laughing",
		"happy",
		"giggling",
		"beaming",
	];
	const neutralExpressions = ["curious", "peaceful", "calm", "attentive"];

	// 70% chance to be happy regardless, or if parent was happy
	if (
		Math.random() > 0.3 ||
		(parentExpression &&
			["happy", "smile", "laugh"].some((e) => parentExpression.includes(e)))
	) {
		return getRandomElement(happyExpressions);
	}

	return getRandomElement(neutralExpressions);
};

export const determineGender = (
	_genderA: string | null,
	_genderB: string | null,
): string => {
	// If both same gender, 50/50 chance for baby or maybe slightly weighted?
	// For now simple 50/50 is best for diversity
	return Math.random() > 0.5 ? "boy" : "girl";
};

export const buildBabyPrompt = (
	faceA: FaceFeatures,
	faceB: FaceFeatures,
): string => {
	const gender = determineGender(faceA.gender, faceB.gender);
	const age = getRandomAge();
	const expression = getRandomExpression(faceA.expression || faceB.expression);

	// Skin tone strategy:
	// A bit of randomness: 40% chance matches parent A, 40% parent B, 20% blend
	let skinTone = "";
	const skinRand = Math.random();
	if (skinRand < 0.4) {
		skinTone = getSkinToneDescription(faceA.skin_tone_lab);
	} else if (skinRand < 0.8) {
		skinTone = getSkinToneDescription(faceB.skin_tone_lab);
	} else {
		skinTone = getBlendedSkinTone(faceA.skin_tone_lab, faceB.skin_tone_lab);
	}

	// Geometry features (mix and match)
	const faceShape =
		Math.random() > 0.5
			? getFaceShapeDescription(faceA.geometry_ratios)
			: getFaceShapeDescription(faceB.geometry_ratios);

	const eyeDesc =
		Math.random() > 0.5
			? getEyeDescription(faceA.geometry_ratios)
			: getEyeDescription(faceB.geometry_ratios);

	// Background variety
	const backgrounds = [
		"soft blurred nursery background",
		"cozy blanket background",
		"soft natural outdoor light",
		"warm indoor lighting",
		"bright airy room",
	];
	const background = getRandomElement(backgrounds);

	// Assemble prompt
	let prompt = `A cute ${age} baby ${gender}`;

	if (skinTone) prompt += ` with ${skinTone}`;
	if (faceShape) prompt += `, ${faceShape}`;
	if (eyeDesc) prompt += `, ${eyeDesc}`;

	prompt += `. ${expression} expression, looking at camera.`;
	prompt += ` ${background}.`;
	prompt += ` High quality portrait photo, highly detailed, photorealistic, cinematic lighting.`;

	return prompt;
};
