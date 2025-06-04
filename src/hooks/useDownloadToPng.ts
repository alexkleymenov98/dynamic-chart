import {useCallback, useRef, useState} from "react";
import html2canvas from 'html2canvas';

export const IGNORE_PDF = 'ignore-pdf'

type TUseDownloadToPngProps = {
    onSuccess?: ()=>void,
    onError?: ()=>void
    fileName: string
    backgroundColor?: string
}

export const useDownloadToPng = ({onSuccess, onError, fileName, backgroundColor }:TUseDownloadToPngProps = {fileName :'image', backgroundColor: '#fffffff'})=>{
    const elementRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(false)

    const onDownloadToPNG = useCallback(async ()=>{
        setIsLoading(true)

        if(!elementRef.current){
            setIsLoading(false)

            onError?.()

            return
        }

        const canvas = await html2canvas(elementRef.current, {
            backgroundColor,
            ignoreElements: (element) => element.classList.contains(IGNORE_PDF),
        });

        try {
            const canvasImage = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.download = `${fileName}.png`
            link.href = canvasImage

            link.click()

            onSuccess?.()
        }
        catch  {
            onError?.()
        }

        setIsLoading(false)
    },[])

    return {
        elementRef,
        onDownloadToPNG,
        isLoading,
    }
}