export interface InterestedDeveloper {
  id: number;
  type: 'DEVELOPER';
  name: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  soleDeveloper: boolean;
  wantPartnership: boolean;
  estimatedBudget: string;
  hasMoreInfo: boolean;
  moreInfo: string;
}
