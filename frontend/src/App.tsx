import "./App.css";
import { PiVisualization } from "./components/PiVisualization";
import { PiIcon, Twitter, Mail, CoffeeIcon } from "lucide-react";
// import { Button } from "./components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
function App() {
  return (
    <div>
      {" "}
      <header
        className="flex flex-col mb-12 sm:flex-row justify-between items-center space-y-4 sm:space-y-0 max-w-6xl mx-auto p-4 mt-6
      "
      >
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center">
            <PiIcon className="mr-2" size={36} />
            GrowPi
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://x.com/n4ze3m"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:text-primary-dark inline-flex items-center gap-2 transition-colors"
                >
                  <Twitter size={16} />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Twitter</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="mailto:me@n4ze3m.com"
                  className="text-primary text-xs hover:text-primary-dark inline-flex items-center gap-2 transition-colors"
                >
                  <Mail size={16} />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Email</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://ko-fi.com/n4ze3m"
                  target="_blank"
                  className="text-primary hidden text-xs hover:text-primary-dark inline-flexx items-center gap-2 transition-colors"
                >
                  <CoffeeIcon size={16} />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Buy me a coffee 🥺
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => window.open("https://example.com/donate", "_blank")}
          >
            <Heart size={16} className="text-red-500" />
            <span>Support</span>
          </Button> */}
        </div>
      </header>
      <PiVisualization />
    </div>
  );
}

export default App;
