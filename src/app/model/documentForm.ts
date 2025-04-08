export interface DocumentForm {
  name: string;
  description: string;
  publicFile: boolean;
  organization: {
    _id: string;
    name: string;
  };
  division: string;
};