
export type ParentInfo = {
    name: string;
    relation: string;
    avatar: any; // For image source
    phoneNumber: string; // Parent's phone number
  };
  
  export const parents: ParentInfo[] = [
    {
      name: "Jack",
      relation: "Father",
      avatar: require("../../assets/images/speed.webp"),
      phoneNumber: "+65 90357989",
    },
    {
      name: "Chloe",
      relation: "Mother",
      avatar: require("../../assets/images/speed.webp"),
      phoneNumber: "+65 96678005",
    },
  ];
  