"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./ExpandableContent.module.css";


interface ExpandableContentProps {
  children: React.ReactNode;
  maxHeight?: number;
}

const ExpandableContent = ({ children, maxHeight = 200 }: ExpandableContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setShouldShowButton(contentHeight > maxHeight);
    }
  }, [maxHeight]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={` ${!isExpanded && shouldShowButton ? `max-h-[${maxHeight}px] overflow-hidden` : 'max-h-none'
          }`}
        style={{
          maxHeight: !isExpanded && shouldShowButton ? `${maxHeight}px` : 'none'
        }}
      >
        <div className="[&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5">
          {children}
        </div>
      </div>

      {shouldShowButton && (

        <div className={`${!isExpanded ? `absolute bottom-0 left-0 right-0 ${styles.topBlur}` : 'relative pt-4'}`}>
          <div className="flex justify-center bg-white dark:bg-[var(--background)] relative">

            <Button
              onClick={toggleExpanded}
              variant="default"
              className="flex items-center gap-2 cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  ดูน้อยลง
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  ดูเพิ่มเติม
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandableContent;
