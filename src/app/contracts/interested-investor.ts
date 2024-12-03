export interface InterestedInvestor {
  id: number;
  type: 'INVESTOR';
  name: string;
  profession: string;
  email: string;
  phoneNumber: string;
  nationality: number;
  countryOfResidence: number;
  passportNumber: string;
  numberOfFamilyMembers: number;
  interestPurchasing: string;
  estimatedBudget: number;
  investmentIntend: string;
  resideInQatar: boolean;
  hasMoreInfo: boolean;
  moreInfo: string;
}
