export function shareOnTwitter(params: { question: string; flipId: number; side?: 'yes' | 'no' }) {
  const { question, flipId, side } = params;
  const baseUrl = 'https://flip-stake.vercel.app';
  const flipUrl = `${baseUrl}/flip/${flipId}`;
  
  let text: string;
  if (side) {
    text = `I'm betting ${side.toUpperCase()} on "${question}" 🔥\n\nStake your STX and predict the outcome on StackFlip 👇\n${flipUrl}`;
  } else {
    text = `"${question}" — What do you think? YES or NO? 🤔\n\nStake STX on StackFlip 👇\n${flipUrl}`;
  }

  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
}
