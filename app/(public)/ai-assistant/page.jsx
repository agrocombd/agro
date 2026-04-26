import AIChatClient from "./AIChatClient";

export const metadata = {
  title: "কৃষি AI সহকারী — Agro.com.bd",
  description: "AI-চালিত কৃষি পরামর্শ সেবা। ফসল রোগ, সার, বীজ, সেচ সহ সব কৃষি প্রশ্নের উত্তর পান।",
};

export default function AIAssistantPage() {
  return <AIChatClient />;
}
