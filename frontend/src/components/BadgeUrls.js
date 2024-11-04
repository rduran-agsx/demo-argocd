export const badgeUrls = {
  "AWS Certified Cloud Practitioner": 
    "https://images.credly.com/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png",
  "AWS Certified Machine Learning Specialty": 
    "https://images.credly.com/images/778bde6c-ad1c-4312-ac33-2fa40d50a147/image.png",
  "AWS Certified Solutions Architect Associate": 
    "https://images.credly.com/images/0e284c3f-5164-4b21-8660-0d84737941bc/image.png",
  "AWS Certified Developer Associate": 
    "https://images.credly.com/images/b9feab85-1a43-4f6c-99a5-631b88d5461b/twitter_thumb_201604_image.png",
  "AWS Certified Database Specialty": 
    "https://images.credly.com/images/885d38e4-55c0-4c35-b4ed-694e2b26be6c/image.png",
  "AWS Certified Solutions Architect Professional": 
    "https://images.credly.com/images/2d84e428-9078-49b6-a804-13c15383d0de/twitter_thumb_201604_image.png",
  "AWS Certified Data Analytics Specialty": 
    "https://images.credly.com/images/6430efe4-0ac0-4df6-8f1b-9559d8fcdf27/image.png",
  "AWS Certified Data Engineer Associate": 
    "https://images.credly.com/images/e5c85d7f-4e50-431e-b5af-fa9d9b0596e7/image.png",
  "AWS Certified Advanced Networking Specialty": 
    "https://images.credly.com/images/4d08274f-64c1-495e-986b-3143f51b1371/image.png",
  "AWS Certified SysOps Administrator Associate": 
    "https://images.credly.com/images/f0d3fbb9-bfa7-4017-9989-7bde8eaf42b1/image.png",
  "AWS Certified SAP on AWS Specialty": 
    "https://images.credly.com/images/57bb7f6a-441f-4356-a2f1-7693227a475e/image.png",
  "AWS Certified Security Specialty": 
    "https://images.credly.com/images/53acdae5-d69f-4dda-b650-d02ed7a50dd7/image.png",
  "AWS Certified DevOps Engineer Professional": 
    "https://images.credly.com/images/bd31ef42-d460-493e-8503-39592aaf0458/image.png",
  "AWS Certified Big Data Specialty": 
    "https://images.credly.com/images/1e4003a1-ffd4-4eb9-a9da-e14f486255d9/image.png",
  "AWS Certified Alexa Skill Builder Specialty": 
    "https://images.credly.com/images/dd75723c-9629-4511-8c19-154244c5423a/image.png",
  "AWS Certified SysOps Administrator Associate (Twitter)": 
    "https://images.credly.com/images/f0d3fbb9-bfa7-4017-9989-7bde8eaf42b1/twitter_thumb_201604_image.png",
  "Google Professional Google Workspace Administrator": 
    "https://images.credly.com/images/16d3e89c-4af5-47d8-a502-2a93b02c26d4/twitter_thumb_201604_image.png",
  "Google Professional Data Engineer": 
    "https://images.credly.com/images/2d613ff8-8879-430b-b2d8-925fa29785e8/twitter_thumb_201604_image.png",
  "Google Ads Individual Qualification": 
    "https://dangil.tech/wp-content/uploads/2023/07/95f440c5-001c-4976-9a43-d6631b41d11a-removebg-preview-1.png",
  "Google Cloud Digital Leader": 
    "https://images.credly.com/images/44994cda-b5b0-44cb-9a6d-d29b57163073/twitter_thumb_201604_image.png",
  "Google Professional Cloud Network Engineer": 
    "https://images.credly.com/images/08a802bf-f2fa-44fb-8110-92acf6195738/twitter_thumb_201604_image.png",
  "Google Video Advertising": 
    "https://cdn.prod.website-files.com/64fb3aaa0b5ad657cf3e7091/6553beb0175c7efd85c3dd3c_Google%20Ads%20Video%20Certification.png",
  "Google Professional ChromeOS Administrator": 
    "https://pbs.twimg.com/media/FfTg_POXEAYvXFy.png",
  "Google Search Advertising": 
    "https://www.pageoneppc.com/assets/img/badges/search-certified.png",
  "Google Professional Cloud Database Engineer": 
    "https://images.credly.com/images/275e69a5-33a8-4d9c-bad4-2bdc0dfb7d40/twitter_thumb_201604_image.png",
  "Google Analytics Individual Qualification": 
    "https://framerusercontent.com/images/8lRjLVdJ5qy69IGCISC9dUSUvQ.png",
  "Google Professional Cloud Developer": 
    "https://images.credly.com/images/614465c6-1d80-4ae6-a323-753de224422a/twitter_thumb_201604_image.png",
  "Google G Suite Certification": 
    "https://dw2q8mfb3dci9.cloudfront.net/pub/media/wysiwyg/gcp-gsuite.png",
  "Google Professional Collaboration Engineer": 
    "https://certwizard.com/sites/default/files/2020-04/Google-Collaboration-Engineer-certwizard.png",
  "Google AdWords Fundamentals": 
    "https://simonpointer.com/wp-content/uploads/2020/08/Google_Ads2-600x338.png",
  "Google Professional Machine Learning Engineer": 
    "https://images.credly.com/images/05e71e7e-92a1-4821-8530-4176b2e3c4b4/twitter_thumb_201604_image.png",
  "Google Professional Cloud Security Engineer": 
    "https://images.credly.com/images/4ea0ec5c-6258-4c26-9282-6ed233c0c7ac/image.png",
  "Google Professional Cloud DevOps Engineer": 
    "https://images.credly.com/images/33f08b7e-fa6a-41cd-810a-21cc1c336f6d/twitter_thumb_201604_image.png",
  "Google Associate Cloud Engineer": 
    "https://images.credly.com/size/680x680/images/08096465-cbfc-4c3e-93e5-93c5aa61f23e/image.png",
  "Google Professional Cloud Architect": 
    "https://images.credly.com/images/71c579e0-51fd-4247-b493-d2fa8167157a/twitter_thumb_201604_image.png"
};

export const getBadgeUrl = (examTitle) => {
  // Remove exam code if present
  const titleWithoutCode = examTitle.replace(/^[A-Z0-9-]+:\s*/, '');
  
  // Try to find an exact match
  if (badgeUrls[titleWithoutCode]) {
    return badgeUrls[titleWithoutCode];
  }

  // If no exact match, try to find a partial match
  const partialMatch = Object.keys(badgeUrls).find(key => 
    titleWithoutCode.toLowerCase().includes(key.toLowerCase())
  );

  return partialMatch ? badgeUrls[partialMatch] : `/api/placeholder/150/150`;
};