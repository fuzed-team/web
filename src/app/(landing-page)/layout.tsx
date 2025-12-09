import type React from "react";

interface Props {
	children: React.ReactNode;
}

const LandingPageLayout = ({ children }: Props) => {
	return <>{children}</>;
};

export default LandingPageLayout;
