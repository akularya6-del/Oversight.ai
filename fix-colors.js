const fs = require('fs');

function replaceFile(path, replacer) {
  let content = fs.readFileSync(path, 'utf8');
  content = replacer(content);
  fs.writeFileSync(path, content);
}

replaceFile('src/components/ShowcaseClient.tsx', (c) => 
  c.replace(/#B7955B/g, '#10B981').replace(/rgba\(183,149,91/g, 'rgba(16,185,129')
);

replaceFile('src/components/ActionCard.tsx', (c) => {
  let res = c.replace(/#B7955B/g, '#10B981').replace(/rgba\(183,149,91/g, 'rgba(16,185,129');
  // VIP should be amber
  res = res.replace(/isVip && "border-l-\[3px\] border-l-\[#10B981\] shadow-\[inset_2px_0_10px_rgba\(16,185,129,0.1\)\]"/,
    'isVip && "border-l-[3px] border-l-[#F59E0B] shadow-[inset_2px_0_10px_rgba(245,158,11,0.1)]"');
  return res;
});

replaceFile('src/components/FollowupCard.tsx', (c) => 
  c.replace(/#B7955B/g, '#F59E0B').replace(/rgba\(183,149,91/g, 'rgba(245,158,11')
);

replaceFile('src/components/Dashboard.tsx', (c) => {
  let res = c.replace(/#B7955B/g, '#10B981').replace(/rgba\(183,149,91/g, 'rgba(16,185,129');
  // VIP crown should be amber
  res = res.replace(/Crown className="w-3.5 h-3.5 text-\[#10B981\]"/g, 'Crown className="w-3.5 h-3.5 text-[#F59E0B]"');
  // Follow-up Intelligence dot should be amber
  res = res.replace(/<span className="w-2 h-2 rounded bg-\[#10B981\] shadow-\[0_0_10px_rgba\(16,185,129,0.5\)\]" \/>\n\s*Follow-up Intelligence/,
    '<span className="w-2 h-2 rounded bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />\n            Follow-up Intelligence');
  return res;
});

console.log("Colors fixed");
