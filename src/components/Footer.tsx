import { Github, Linkedin, Twitter, Instagram, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 py-6 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Social Links - Left */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <a 
              href="https://github.com/OneAutumnLeef/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors hover:scale-110"
              aria-label="Github"
            >
              <Github size={20} />
            </a>
            <a 
              href="https://linkedin.com/in/derajyojith" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
            <a 
              href="https://x.com/deraj_yojith" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors hover:scale-110"
              aria-label="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a 
              href="https://instagram.com/ig_derajyojith" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://derajyojith.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white transition-colors hover:scale-110"
              aria-label="Website"
            >
              <Globe size={20} />
            </a>
          </div>
          
          {/* Credit - Center */}
          <div className="text-center mb-4 md:mb-0">
            <p className="text-sm">Made with ❤️ by <span className="font-semibold text-amber-400">Deraj Yojith</span></p>
            <p className="text-xs text-gray-500 mt-1">© {new Date().getFullYear()} IPL Auction Manager</p>
          </div>
          
          {/* E-Cell - Right */}
          <div className="flex items-center">
            <div className="mr-3">
              <p className="text-sm font-semibold">Organized by</p>
              <p className="text-s text-gray-400">E-Cell SriCity</p>
              
              {/* E-Cell social links */}
              <div className="flex mt-2 space-x-2">
                <a 
                  href="https://www.instagram.com/ecell.iiits/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors hover:scale-110"
                  aria-label="E-Cell Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://www.linkedin.com/company/e-cell-iiits/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors hover:scale-110"
                  aria-label="E-Cell LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
                {/* <a 
                  href="https://twitter.com/ecell_sricity" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors hover:scale-110"
                  aria-label="E-Cell Twitter"
                >
                  <Twitter size={16} />
                </a> */}
                <a 
                  href="https://e-cell-five.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors hover:scale-110"
                  aria-label="E-Cell Website"
                >
                  <Globe size={16} />
                </a>
              </div>
            </div>
            <div className="h-20 w-20 flex items-center justify-center">
              <img 
                src="https://images.prismic.io/derajportfolio/Z-R2_XdAxsiBv8t0_logo_ecell.png?auto=format,compress" 
                alt="E-Cell Logo" 
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}