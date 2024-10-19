import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, InfoIcon } from "lucide-react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { PointCloud } from "./PointCloud";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PiVisualization() {
  const [piValue, setPiValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [digitCount, setDigitCount] = useState(0);
  const [showAllDigits, setShowAllDigits] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/v1/pi`)
      .then((response) => response.json())
      .then((data) => {
        setPiValue(data.pi);
        setDigitCount(data.pi.length - 1);
      })
      .catch((error) =>
        console.error("Error fetching initial Pi value:", error)
      );

    const eventSource = new EventSource(
      `${import.meta.env.VITE_BASE_URL}/api/v1/pi/stream`
    );
    eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      setPiValue(data);
      setDigitCount(data.length - 1);
      scrollToBottom();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleGrowPi = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!turnstileToken) {
      console.error("Turnstile token not available");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/v1/click`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ turnstileToken }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to grow Pi");
      }
      const data = await response.json();
      setPiValue(data.pi);
      setDigitCount(data.pi.length - 1);
      if (turnstileRef?.current) {
        turnstileRef.current.reset();
      }
    } catch (error) {
      console.error("Error growing Pi:", error);
    } finally {
      setIsLoading(false);
      setTurnstileToken(null);
    }
  };

  //@ts-expect-error
  const toggleShowAllDigits = () => {
    setShowAllDigits(!showAllDigits);
  };

  const displayPiValue = () => {
    return piValue;
    if (digitCount <= 5000 || showAllDigits) {
      return piValue;
    }
    return `${piValue.slice(0, 5000)}...`;
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([piValue], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "pi.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const calculateReadingTime = () => {
    const digitsPerSecond = 1.5;
    const seconds = Math.round(digitCount / digitsPerSecond);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex flex-col space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <p className="text-sm sm:text-base text-muted-foreground">
        This is a real-time update of Pi growing based on clicks on the Grow Pi
        button by visitors
      </p>
      <Card className="w-full">
        <CardContent className="p-0">
          <div className="w-full aspect-[16/9] rounded-t-lg overflow-hidden relative">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <color attach="background" args={["#000000"]} />
              <PointCloud piValue={piValue} />
              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                rotateSpeed={0.5}
              />
            </Canvas>
            <div className="absolute bottom-2 right-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      How Pi is Calculated and Displayed
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    <p>
                      Pi is calculated using a server-side algorithm that
                      generates digits on demand.
                    </p>
                    <p>
                      The visualization uses Three.js to create a 3D point cloud
                      where each point's position is calculated as follows:
                    </p>
                    <div className="my-4 text-center">
                      <InlineMath>{`x = r \\cos(\\theta)`}</InlineMath>
                      <br />
                      <InlineMath>{`y = r \\sin(\\theta)`}</InlineMath>
                      <br />
                      <InlineMath>{`z = \\frac{i}{n} \\cdot 0.5`}</InlineMath>
                      <br />
                      <InlineMath>{`r = 2 + d_i \\cdot 0.1`}</InlineMath>
                      <br />
                      <InlineMath>{`\\theta = \\frac{i}{n} \\cdot 2\\pi`}</InlineMath>
                    </div>
                    <p>Where:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>
                        <InlineMath>{"i"}</InlineMath> is the index of the digit
                      </li>
                      <li>
                        <InlineMath>{"n"}</InlineMath> is the total number of
                        digits
                      </li>
                      <li>
                        <InlineMath>{"d_i"}</InlineMath> is the value of the
                        i-th digit of Pi
                      </li>
                    </ul>
                    <p className="mt-2">
                      The color of each point is also determined by the digit's
                      value, creating a vibrant and dynamic visualization that
                      updates in real-time as new digits are calculated.
                    </p>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <form
        onSubmit={handleGrowPi}
        className="flex flex-col items-center space-y-4"
      >
        <Button
          type="submit"
          disabled={isLoading || !turnstileToken}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Growing...
            </>
          ) : (
            "Grow PI"
          )}
        </Button>
        <span className="text-[8px] text-muted-foreground">
          form is protected by Cloudflare Turnstile to prevent bots
        </span>
        <Turnstile
          siteKey={import.meta.env.TURNSTILE_SITE_KEY}
          ref={turnstileRef}
          onSuccess={(token) => setTurnstileToken(token)}
          options={{
            theme: "light",
            size: "invisible",
          }}
        />
      </form>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl mb-2 sm:mb-0">
            Current PI Value
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <p className="text-sm text-muted-foreground cursor-help">
              Total digits: {digitCount.toLocaleString()}
            </p>

            {/* <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download pi.txt"
              className="hidden sm:inline-flex"
            >
              <Download className="h-4 w-4" />
            </Button> */}
          </div>
        </CardHeader>
        <CardContent ref={scrollRef} className="h-96 sm:h-96 overflow-y-auto">
          <p className="font-mono text-xs sm:text-sm break-all bg-muted p-2 sm:p-4 rounded-md">
            {displayPiValue()}
          </p>
        </CardContent>
        <CardFooter className="flex mt-6 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-muted-foreground cursor-help">
                  {"Est reading time: "}
                  {calculateReadingTime()}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Calculated assuming 1.5 digits read per second</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            title="Download pi.txt"
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
