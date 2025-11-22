import type React from "react";

interface Props {
	children: React.ReactNode;
}

const MarketingLayout = ({ children }: Props) => {
	return <>{children}</>;
};

export default MarketingLayout;
