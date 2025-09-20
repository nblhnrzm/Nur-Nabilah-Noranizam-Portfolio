import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-utils';

// Function to generate username suggestions
function generateUsernameSuggestions(baseUsername: string): string[] {
  const suggestions: string[] = [];
  const cleanBase = baseUsername.trim();
  const cleanBaseNoSpaces = baseUsername.replace(/\s+/g, '');
  
  // Extract meaningful parts for smarter suggestions
  const words = cleanBase.split(/[\s._\-@#$%&*+!?]+/).filter(word => word.length > 0);
  const hasNumbers = /\d/.test(cleanBase);
  const hasSymbols = /[._\-@#$%&*+!?]/.test(cleanBase);
  
  // Generate random numbers and years
  const currentYear = new Date().getFullYear();
  const randomNums = [
    Math.floor(Math.random() * 99) + 1,
    Math.floor(Math.random() * 999) + 100,
    Math.floor(Math.random() * 9999) + 1000,
    currentYear,
    currentYear - Math.floor(Math.random() * 10),
    String(currentYear).slice(-2)
  ];
  
  // Common username patterns and separators
  const separators = ['_', '.', '-', '', '@'];
  const prefixes = ['the', 'mr', 'ms', 'real', 'official', 'pro', 'super'];
  const suffixes = ['x', 'pro', 'official', 'real', 'master', 'boss', 'king', 'queen'];
  
  // 1. Simple number additions (preserve original format)
  for (let i = 0; i < 3; i++) {
    suggestions.push(`${cleanBase}${randomNums[i]}`);
  }
  
  // 2. Case variations with numbers
  const lowerBase = cleanBase.toLowerCase();
  const titleCase = cleanBase.charAt(0).toUpperCase() + cleanBase.slice(1).toLowerCase();
  suggestions.push(`${lowerBase}${randomNums[0]}`);
  suggestions.push(`${titleCase}${randomNums[1]}`);
  
  // 3. Word combinations (if multiple words detected)
  if (words.length > 1) {
    // Reverse word order
    const reversedWords = [...words].reverse().join('');
    suggestions.push(`${reversedWords}${randomNums[2]}`);
    
    // First letters of each word + numbers
    const initials = words.map(word => word.charAt(0)).join('').toLowerCase();
    suggestions.push(`${initials}${randomNums[3]}`);
    suggestions.push(`${initials.toUpperCase()}${randomNums[0]}`);
    
    // Take first word + random number
    suggestions.push(`${words[0].toLowerCase()}${randomNums[4]}`);
  }
  
  // 4. Add random separators with numbers
  const randomSep1 = separators[Math.floor(Math.random() * separators.length)];
  const randomSep2 = separators[Math.floor(Math.random() * separators.length)];
  suggestions.push(`${cleanBase}${randomSep1}${randomNums[0]}`);
  suggestions.push(`${cleanBase}${randomSep2}${randomNums[5]}`);
  
  // 5. Add prefixes and suffixes
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  suggestions.push(`${randomPrefix}_${lowerBase}`);
  suggestions.push(`${lowerBase}_${randomSuffix}`);
  suggestions.push(`${randomPrefix}${lowerBase}${randomNums[1]}`);
  
  // 6. Leetspeak-style replacements (randomly applied)
  let leetBase = cleanBase.toLowerCase();
  const leetReplacements = [
    ['a', '@'], ['e', '3'], ['i', '1'], ['o', '0'], ['s', '$'], ['t', '7']
  ];
  
  // Apply 1-2 random leet replacements
  const numReplacements = Math.floor(Math.random() * 2) + 1;
  for (let i = 0; i < numReplacements; i++) {
    const [from, to] = leetReplacements[Math.floor(Math.random() * leetReplacements.length)];
    leetBase = leetBase.replace(new RegExp(from, 'g'), to);
  }
  if (leetBase !== cleanBase.toLowerCase()) {
    suggestions.push(`${leetBase}${randomNums[2]}`);
    suggestions.push(`${leetBase}`);
  }
  
  // 7. Without spaces but with smart separators (if original had spaces)
  if (cleanBase !== cleanBaseNoSpaces && words.length > 1) {
    const smartSeparator = separators[Math.floor(Math.random() * 4)]; // Exclude empty string
    suggestions.push(words.join(smartSeparator) + randomNums[3]);
    suggestions.push(words.join(smartSeparator).toLowerCase());
  }
  
  // 8. Birthday/date style (if no numbers in original)
  if (!hasNumbers) {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const days = Array.from({length: 28}, (_, i) => String(i + 1).padStart(2, '0'));
    const randomMonth = months[Math.floor(Math.random() * months.length)];
    const randomDay = days[Math.floor(Math.random() * days.length)];
    
    suggestions.push(`${cleanBase}${randomMonth}${randomDay}`);
    suggestions.push(`${cleanBase}_${randomMonth}${randomDay}`);
  }
  
  // 9. Pattern variations
  const patterns = [
    `${cleanBase}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
    `${cleanBase.charAt(0).toLowerCase()}${cleanBase.slice(1)}${randomNums[0]}`,
    `${cleanBase}${String(currentYear).slice(-2)}${Math.floor(Math.random() * 99)}`,
  ];
  suggestions.push(...patterns);
  
  // 10. Random character additions (maintaining theme)
  if (hasSymbols) {
    const symbolsInUse = cleanBase.match(/[._\-@#$%&*+!?]/g) || [];
    if (symbolsInUse.length > 0) {
      const randomSymbol = symbolsInUse[Math.floor(Math.random() * symbolsInUse.length)];
      suggestions.push(`${cleanBase}${randomSymbol}${randomNums[1]}`);
    }
  }
  
  // Remove duplicates, filter out empty/invalid suggestions, and return random selection
  const uniqueSuggestions = [...new Set(suggestions)]
    .filter(s => s && s.length >= 3 && s.length <= 30)
    .filter(s => s !== cleanBase); // Don't suggest the original
    
  // Shuffle and return first 8
  return uniqueSuggestions
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);
}

// Function to check if suggestions are available
async function getAvailableSuggestions(suggestions: string[]): Promise<string[]> {
  const availableSuggestions: string[] = [];
    for (const suggestion of suggestions) {
    const { data, error } = await supabaseAdmin
      .from('app_user')
      .select('id')
      .eq('username', suggestion)
      .maybeSingle();
    
    if (!error && !data) {
      availableSuggestions.push(suggestion);
    }
    
    // Stop when we have 4 available suggestions
    if (availableSuggestions.length >= 4) {
      break;
    }
  }
  
  return availableSuggestions;
}

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    const trimmedUsername = username?.trim();

    // Validate input
    if (!trimmedUsername) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }    // Query 'app_user' table for existing username (case-sensitive)
    const { data, error } = await supabaseAdmin
      .from('app_user')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle();if (error) {
      console.error('[check-username] Supabase error:', error.message);
      return NextResponse.json(
        { error: 'Failed to check username' },
        { status: 500 }
      );
    }

    if (data) {
      // Username exists, generate suggestions
      console.log(`[check-username] Username ${trimmedUsername} exists, generating suggestions`);
      const suggestions = generateUsernameSuggestions(trimmedUsername);
      const availableSuggestions = await getAvailableSuggestions(suggestions);
      
      return NextResponse.json({ 
        exists: true, 
        suggestions: availableSuggestions 
      });
    }

    console.log(`[check-username] Username ${trimmedUsername} is available`);
    return NextResponse.json({ exists: false });
  } catch (err: any) {
    console.error('[check-username] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
