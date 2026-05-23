export interface ClubCatalogItem {
  name: string
  shortName: string
  logoUrl: string
  location: string
  zone: string
  courts: number
  venueDetails: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

export const CLUB_CATALOG: ClubCatalogItem[] = [
  { name: 'Cana Beau Plan', shortName: 'CANA BP', logoUrl: '/club-logos/cana-padel.png', location: 'Beau Plan', zone: 'Nord', courts: 5, venueDetails: 'Lieu: Beau Plan | Zone: Nord | Terrains: 5', contactName: 'Mathieu Vallet', contactPhone: '59792962', contactEmail: '' },
  { name: 'Club Med Albion', shortName: 'CLUB MED', logoUrl: '/club-logos/club-med.png', location: 'Albion', zone: 'Ouest', courts: 3, venueDetails: 'Lieu: Albion | Zone: Ouest | Terrains: 3', contactName: 'Romain Beltrando', contactPhone: '59365037', contactEmail: '' },
  { name: 'Urban Sport Grand Baie', shortName: 'US GB', logoUrl: '/club-logos/urban-sport.png', location: 'Grand Baie', zone: 'Nord', courts: 3, venueDetails: 'Lieu: Grand Baie | Zone: Nord | Terrains: 3', contactName: 'Pascal Hoffmann', contactPhone: '52580551', contactEmail: '' },
  { name: 'Urban Sport Black River', shortName: 'US BR', logoUrl: '/club-logos/urban-sport.png', location: 'Black River', zone: 'Ouest', courts: 4, venueDetails: 'Lieu: Black River | Zone: Ouest | Terrains: 4', contactName: 'Pascal Hoffmann', contactPhone: '52580551', contactEmail: '' },
  { name: 'SPARC Cascavelle', shortName: 'SPARC', logoUrl: '/club-logos/sparc.png', location: 'Cascavelle', zone: 'Ouest', courts: 4, venueDetails: 'Lieu: Cascavelle | Zone: Ouest | Terrains: 4', contactName: 'Maxime Huyse', contactPhone: '54810753', contactEmail: '' },
  { name: 'RM Club Tamarin', shortName: 'RM TAM', logoUrl: '/club-logos/rm-tamarin.png', location: 'Tamarin', zone: 'Ouest', courts: 5, venueDetails: 'Lieu: Tamarin | Zone: Ouest | Terrains: 5', contactName: 'Coline Aumard', contactPhone: '55080718', contactEmail: '' },
  { name: 'I Padel by RM Hennessy', shortName: 'IPADEL H', logoUrl: '/club-logos/ipadel-rm.png', location: 'Hennessy', zone: 'Centre', courts: 4, venueDetails: 'Lieu: Hennessy | Zone: Centre | Terrains: 4', contactName: 'Coline Aumard', contactPhone: '55080718', contactEmail: '' },
  { name: 'RM Club Forbach', shortName: 'RM FOR', logoUrl: '/club-logos/rm-grand-baie-v2.png', location: 'Grand Baie', zone: 'Nord', courts: 7, venueDetails: 'Lieu: Grand Baie | Zone: Nord | Terrains: 7', contactName: 'Coline Aumard', contactPhone: '55080718', contactEmail: '' },
  { name: 'Labourdonnais Mapou', shortName: 'LAB MAP', logoUrl: '/club-logos/labourdonnais-v2.png', location: 'Mapou', zone: 'Nord', courts: 3, venueDetails: 'Lieu: Mapou | Zone: Nord | Terrains: 3', contactName: 'Mickael Gosch', contactPhone: '54752121', contactEmail: '' },
  { name: 'I Padel by RM Port Chambly', shortName: 'IPADEL PC', logoUrl: '/club-logos/ipadel-rm.png', location: 'Port Chambly', zone: 'Centre', courts: 3, venueDetails: 'Lieu: Port Chambly | Zone: Centre | Terrains: 3', contactName: 'Coline Aumard', contactPhone: '55080718', contactEmail: '' },
  { name: 'Studio by RM Azuri', shortName: 'STUDIO RM', logoUrl: '/club-logos/studio-rm.png', location: 'Azuri', zone: 'Est', courts: 3, venueDetails: 'Lieu: Azuri | Zone: Est | Terrains: 3', contactName: 'Coline Aumard', contactPhone: '55080718', contactEmail: '' },
  { name: 'Isla Padel Grand Baie', shortName: 'ISLA GB', logoUrl: '/club-logos/isla-padel-v2.png', location: 'Grand Baie', zone: 'Nord', courts: 6, venueDetails: 'Lieu: Grand Baie | Zone: Nord | Terrains: 6', contactName: 'Florian Manson', contactPhone: '57553320', contactEmail: '' },
  { name: 'Terres Brunes Sports & Leisure', shortName: 'TBRUNES', logoUrl: '/club-logos/terres-brunes.png', location: 'Tamarin', zone: 'Ouest', courts: 3, venueDetails: 'Lieu: Tamarin | Zone: Ouest | Terrains: 3', contactName: 'Marinne Giraud', contactPhone: '54239475', contactEmail: '' },
  { name: 'Mont Choisy Golf', shortName: 'MCHOISY', logoUrl: '/club-logos/mont-choisy.png', location: 'Mont Choisy', zone: 'Nord', courts: 2, venueDetails: 'Lieu: Mont Choisy | Zone: Nord | Terrains: 2', contactName: 'Sarvish Kinnoo', contactPhone: '57726006', contactEmail: '' },
  { name: 'Oxygen Moka', shortName: 'OXYGEN', logoUrl: '/club-logos/oxygen.png', location: 'Moka', zone: 'Centre', courts: 2, venueDetails: 'Lieu: Moka | Zone: Centre | Terrains: 2', contactName: 'Matteo Zinno', contactPhone: '57463006', contactEmail: '' },
  { name: 'Club House Black River', shortName: 'CH BR', logoUrl: '/club-logos/club-house-tamarin.png', location: 'Black River', zone: 'Ouest', courts: 2, venueDetails: 'Lieu: Black River | Zone: Ouest | Terrains: 2', contactName: 'Alexis Lavie', contactPhone: '54941771', contactEmail: '' },
  { name: 'Energia Pointe aux Canonniers', shortName: 'ENERGIA', logoUrl: '/club-logos/energia.png', location: 'Pointe aux Canonniers', zone: 'Nord', courts: 2, venueDetails: 'Lieu: Pointe aux Canonniers | Zone: Nord | Terrains: 2', contactName: 'Damien Putteea', contactPhone: '59386076', contactEmail: '' },
  { name: 'Moka Rangers', shortName: 'MOKA R', logoUrl: '', location: 'Moka', zone: 'Centre', courts: 4, venueDetails: 'Lieu: Moka | Zone: Centre | Terrains: 4', contactName: 'Mathias Ritter', contactPhone: '58013256', contactEmail: '' },
]

export const CLUB_LOGOS = CLUB_CATALOG.map(club => club.logoUrl)
