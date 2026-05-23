export interface ClubCatalogItem {
  name: string
  shortName: string
  logoUrl: string
  venueDetails: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export const CLUB_CATALOG: ClubCatalogItem[] = [
  { name: 'Cana Padel', shortName: 'CANA', logoUrl: '/club-logos/cana-padel.png', venueDetails: 'Cana Padel', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Club House Tamarin', shortName: 'CHT', logoUrl: '/club-logos/club-house-tamarin.png', venueDetails: 'Club House Tamarin', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Club Med', shortName: 'CLUB MED', logoUrl: '/club-logos/club-med.png', venueDetails: 'Club Med Mauritius', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Energia', shortName: 'ENERGIA', logoUrl: '/club-logos/energia.png', venueDetails: 'Energia Sports Club', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'iPadel RM', shortName: 'IPADEL', logoUrl: '/club-logos/ipadel-rm.png', venueDetails: 'RM Club / iPadel', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Isla Padel', shortName: 'ISLA', logoUrl: '/club-logos/isla-padel-v2.png', venueDetails: 'Isla Padel', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Labourdonnais', shortName: 'LAB', logoUrl: '/club-logos/labourdonnais-v2.png', venueDetails: 'Labourdonnais Sports Club', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Mont Choisy', shortName: 'MCHOISY', logoUrl: '/club-logos/mont-choisy.png', venueDetails: 'Mont Choisy', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Oxygen', shortName: 'OXYGEN', logoUrl: '/club-logos/oxygen.png', venueDetails: 'Oxygen Club', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'RM Grand Baie', shortName: 'RM GB', logoUrl: '/club-logos/rm-grand-baie-v2.png', venueDetails: 'RM Grand Baie', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'RM Tamarin', shortName: 'RM TAM', logoUrl: '/club-logos/rm-tamarin.png', venueDetails: 'RM Tamarin', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'RN1 Grand Baie', shortName: 'RN1 GB', logoUrl: '/club-logos/rn1-grand-baie.png', venueDetails: 'RN1 Grand Baie', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'SPARC', shortName: 'SPARC', logoUrl: '/club-logos/sparc.png', venueDetails: 'SPARC Sports Club', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Studio RM', shortName: 'STUDIO RM', logoUrl: '/club-logos/studio-rm.png', venueDetails: 'Studio RM', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Synergy', shortName: 'SYNERGY', logoUrl: '/club-logos/synergy-v2.png', venueDetails: 'Synergy Sports Club', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Terres Brunes', shortName: 'TBRUNES', logoUrl: '/club-logos/terres-brunes.png', venueDetails: 'Terres Brunes', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Urban Padel', shortName: 'URBAN P', logoUrl: '/club-logos/urban-padel.png', venueDetails: 'Urban Padel', contactName: 'A completer', contactPhone: '', contactEmail: '' },
  { name: 'Urban Sport', shortName: 'URBAN S', logoUrl: '/club-logos/urban-sport.png', venueDetails: 'Urban Sport', contactName: 'A completer', contactPhone: '', contactEmail: '' },
]

export const CLUB_LOGOS = CLUB_CATALOG.map(club => club.logoUrl)
