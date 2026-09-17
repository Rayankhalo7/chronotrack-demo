export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('chronotrack-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
