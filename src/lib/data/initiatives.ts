export type InitiativeCategory =
	'rescue' | 'rehabilitation' | 'sanctuary' | 'education' | 'biodiversity';

export interface InitiativeItem {
	id: string;
	slug: string;
	titleUk: string;
	titleEn: string;
	summaryUk: string;
	summaryEn: string;
	category: InitiativeCategory;
	targetYear: number;
	impactCount: number;
	impactUnitUk: string;
	impactUnitEn: string;
	isActive: boolean;
}

export const INITIATIVES: InitiativeItem[] = [
	{
		id: 'init-wildlife-rescue',
		slug: 'wildlife-emergency-evacuation',
		titleUk: 'Евакуація та порятунок тварин із зон лиха',
		titleEn: 'Disaster Zone Wildlife Evacuation & Rescue',
		summaryUk:
			'Оперативні виїзди мобільних ветеринарних груп для порятунку постраждалих диких звірів та птахів.',
		summaryEn:
			'Rapid deployment of mobile veterinary response teams to extract injured wildlife from danger zones.',
		category: 'rescue',
		targetYear: 2026,
		impactCount: 1250,
		impactUnitUk: 'врятованих тварин',
		impactUnitEn: 'animals rescued',
		isActive: true
	},
	{
		id: 'init-rehab-center',
		slug: 'national-rehabilitation-center',
		titleUk: 'Будівництво Національного центру реабілітації хижаків',
		titleEn: 'Construction of National Predator Rehabilitation Center',
		summaryUk:
			'Створення природних вольєрних комплексів для довготривалого лікування та реадаптації великих хижаків.',
		summaryEn:
			'Developing naturalistic enclosure complexes for long-term recovery and readaptation of large carnivores.',
		category: 'rehabilitation',
		targetYear: 2027,
		impactCount: 45,
		impactUnitUk: 'гектарів природного ареалу',
		impactUnitEn: 'hectares of natural sanctuary',
		isActive: true
	},
	{
		id: 'init-avian-flyway',
		slug: 'avian-flyway-sanctuary',
		titleUk: 'Захист мігруючих птахів та польовий шпиталь',
		titleEn: 'Migratory Bird Protection & Field Hospital',
		summaryUk:
			'Спеціалізований польовий стаціонар для водоплавних і хижих птахів під час сезонних перельотів.',
		summaryEn: 'Specialized field hospital for waterfowl and raptors along key migratory flyways.',
		category: 'biodiversity',
		targetYear: 2026,
		impactCount: 380,
		impactUnitUk: 'птахів випущено на волю',
		impactUnitEn: 'birds released to the wild',
		isActive: true
	},
	{
		id: 'init-eco-education',
		slug: 'humane-wildlife-coexistence',
		titleUk: 'Освітня програма гуманного співіснування',
		titleEn: 'Humane Wildlife Coexistence Educational Program',
		summaryUk:
			'Просвітницькі тренінги та інтерактивні лекції для громад щодо безпечного поводження з дикою фауною.',
		summaryEn:
			'Public awareness workshops and interactive community training on peaceful coexistence with wildlife.',
		category: 'education',
		targetYear: 2026,
		impactCount: 15000,
		impactUnitUk: 'слухачів курсів',
		impactUnitEn: 'community participants',
		isActive: true
	}
];
