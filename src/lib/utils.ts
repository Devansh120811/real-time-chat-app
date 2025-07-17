import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import animationData from '@/assets/lottie-json.json'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const colorStyles = [
  "bg-[#712c4a57] text-[#ff006e] border-[1px] border-[#ff006faa]",
  "bg-[#2b4a7157] text-[#006eff] border-[1px] border-[#006effaa]",
  "bg-[#4a712c57] text-[#6eff00] border-[1px] border-[#6eff00aa]",
  "bg-[#714a2c57] text-[#ffae00] border-[1px] border-[#ffae00aa]"
];

export const getColor = (color:number)=>{
  if (color>=0 && color<colorStyles.length) {
      return colorStyles[color]
  }
  return colorStyles[0]
}
export const animationDefaultOption = {
  loop:true,
  autoplay:true,
  animationData
}