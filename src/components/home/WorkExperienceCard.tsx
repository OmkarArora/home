import { Building, Calendar } from "lucide-react";

export default function WorkExperienceCard({
	title,
	company,
	startDate,
	endDate,
	description,
}: {
	title: string;
	company: string;
	startDate: string;
	endDate: string;
	description: string[];
}) {
	return (
		<div className="border-l-2 border-border pl-6">
			<div className="flex items-start justify-between mb-4">
				<div>
					<h3 className="text-xl font-semibold">{title}</h3>
					<div className="flex items-center text-sm text-muted-foreground mt-1">
						<Building className="w-4 h-4" />
						<span className="pl-1 pr-4">{company}</span>
						<Calendar className="w-4 h-4" />
						<span className="pl-1 pr-2">
							{startDate} - {endDate}
						</span>
					</div>
				</div>
			</div>
			<div className="space-y-3 text-muted-foreground">
				{description.map((item, index) => (
					<p key={index}>{item}</p>
				))}
			</div>
		</div>
	);
}
