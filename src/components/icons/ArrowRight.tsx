import * as React from "react"
const SvgComponent = (props: any) => (
    <svg height="24" width="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M6 12H18M18 12L13 7M18 12L13 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
)
export default SvgComponent