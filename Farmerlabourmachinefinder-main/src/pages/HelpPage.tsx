import { useAuth } from '../state/auth';

const faq = [
  { q: 'How does payment work?', a: 'Payments are held in escrow and released after work completion is confirmed.' },
  { q: 'When will I get money?', a: 'Labourers receive advance first, then balance after completion confirmation.' },
  { q: 'Is deposit refundable?', a: 'Yes. Machine deposits are refunded after completion if there is no damage.' },
  { q: 'What if payment fails?', a: 'Retry from the Payments page or contact support for manual assistance.' },
  { q: 'How to contact support?', a: 'Call +91 90000 00000 or email support@agriconnect.demo.' }
];

export function HelpPage() {
  const { currentUser } = useAuth();
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Help & Chatbot</h1>
        <p className="text-gray-600">
          {currentUser ? 'Ask AgriSahayak for step-by-step guidance.' : 'Login to get role-specific chatbot support.'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faq.map(item => (
          <div key={item.q} className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900">{item.q}</h2>
            <p className="text-sm text-gray-600 mt-2">{item.a}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600">
        Use the floating chatbot button to get instant, role-based answers.
      </div>
    </div>
  );
}


