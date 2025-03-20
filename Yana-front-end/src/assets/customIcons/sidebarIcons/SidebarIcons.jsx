export function DashBoardIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" color="bg-custom-blue" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 7.41244V17.4124C2.5 17.6335 2.5878 17.8454 2.74408 18.0017C2.90036 18.158 3.11232 18.2458 3.33333 18.2458H7.5C7.72101 18.2458 7.93297 18.158 8.08925 18.0017C8.24554 17.8454 8.33333 17.6335 8.33333 17.4124V11.5791H11.6667V17.4124C11.6667 17.6335 11.7545 17.8454 11.9107 18.0017C12.067 18.158 12.279 18.2458 12.5 18.2458H16.6667C16.8877 18.2458 17.0996 18.158 17.2559 18.0017C17.4122 17.8454 17.5 17.6335 17.5 17.4124V7.41244C17.5 7.28306 17.4699 7.15547 17.412 7.03976C17.3542 6.92405 17.2702 6.82339 17.1667 6.74577L10.5 1.74577C10.3558 1.63758 10.1803 1.5791 10 1.5791C9.81969 1.5791 9.64425 1.63758 9.5 1.74577L2.83333 6.74577C2.72984 6.82339 2.64583 6.92405 2.58798 7.03976C2.53012 7.15547 2.5 7.28306 2.5 7.41244ZM4.16667 7.8291L10 3.4541L15.8333 7.8291V16.5791H13.3333V10.7458C13.3333 10.5248 13.2455 10.3128 13.0893 10.1565C12.933 10.0002 12.721 9.91244 12.5 9.91244H7.5C7.27899 9.91244 7.06702 10.0002 6.91074 10.1565C6.75446 10.3128 6.66667 10.5248 6.66667 10.7458V16.5791H4.16667V7.8291Z"
                fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function OrdersIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.4993 4.91276H2.49935C2.02713 4.91276 1.66602 4.55165 1.66602 4.07943C1.66602 3.6072 2.02713 3.24609 2.49935 3.24609H17.4993C17.9716 3.24609 18.3327 3.6072 18.3327 4.07943C18.3327 4.55165 17.9716 4.91276 17.4993 4.91276Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M12.4993 9.3571H2.49935C2.02713 9.3571 1.66602 8.99598 1.66602 8.52376C1.66602 8.05154 2.02713 7.69043 2.49935 7.69043H12.4993C12.9716 7.69043 13.3327 8.05154 13.3327 8.52376C13.3327 8.99598 12.9716 9.3571 12.4993 9.3571Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M17.4993 13.8014H2.49935C2.02713 13.8014 1.66602 13.4403 1.66602 12.9681C1.66602 12.4959 2.02713 12.1348 2.49935 12.1348H17.4993C17.9716 12.1348 18.3327 12.4959 18.3327 12.9681C18.3327 13.4403 17.9716 13.8014 17.4993 13.8014Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M12.4993 18.2458H2.49935C2.02713 18.2458 1.66602 17.8847 1.66602 17.4124C1.66602 16.9402 2.02713 16.5791 2.49935 16.5791H12.4993C12.9716 16.5791 13.3327 16.9402 13.3327 17.4124C13.3327 17.8847 12.9716 18.2458 12.4993 18.2458Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function ParticipantsIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.991 14.6713C16.4237 14.1548 16.6625 13.5034 16.666 12.8296C16.666 12.0561 16.3587 11.3142 15.8117 10.7672C15.2648 10.2202 14.5229 9.91295 13.7493 9.91295H13.516C14.2033 9.09627 14.5809 8.06364 14.5827 6.99628C14.5846 6.22674 14.3928 5.46909 14.0248 4.79321C13.6569 4.11733 13.1247 3.54498 12.4773 3.12894C11.8299 2.7129 11.0882 2.46656 10.3205 2.41263C9.55286 2.35871 8.78399 2.49895 8.0848 2.8204C7.38561 3.14186 6.77861 3.63419 6.31979 4.252C5.86097 4.8698 5.56508 5.59319 5.45943 6.35544C5.35378 7.1177 5.44176 7.89429 5.71525 8.6136C5.98874 9.33291 6.43895 9.97177 7.02435 10.4713C5.44957 11.0731 4.09437 12.1385 3.1377 13.5266C2.18103 14.9148 1.66788 16.5604 1.66602 18.2463C1.66602 18.4673 1.75381 18.6793 1.91009 18.8355C2.06637 18.9918 2.27834 19.0796 2.49935 19.0796C2.72036 19.0796 2.93232 18.9918 3.0886 18.8355C3.24489 18.6793 3.33268 18.4673 3.33268 18.2463C3.33268 16.4782 4.03506 14.7825 5.2853 13.5322C6.53555 12.282 8.23124 11.5796 9.99935 11.5796H11.1243C10.8802 12.0763 10.7865 12.6334 10.8546 13.1827C10.9227 13.7319 11.1497 14.2493 11.5077 14.6713C10.7977 15.0684 10.2065 15.6476 9.79492 16.3492C9.38332 17.0508 9.16623 17.8495 9.16602 18.6629C9.16602 18.884 9.25381 19.0959 9.41009 19.2522C9.56637 19.4085 9.77834 19.4963 9.99935 19.4963C10.2204 19.4963 10.4323 19.4085 10.5886 19.2522C10.7449 19.0959 10.8327 18.884 10.8327 18.6629C10.8327 17.8894 11.14 17.1475 11.687 16.6005C12.2339 16.0536 12.9758 15.7463 13.7493 15.7463C14.5229 15.7463 15.2648 16.0536 15.8117 16.6005C16.3587 17.1475 16.666 17.8894 16.666 18.6629C16.666 18.884 16.7538 19.0959 16.9101 19.2522C17.0664 19.4085 17.2783 19.4963 17.4993 19.4963C17.7204 19.4963 17.9323 19.4085 18.0886 19.2522C18.2449 19.0959 18.3327 18.884 18.3327 18.6629C18.3325 17.8495 18.1154 17.0508 17.7038 16.3492C17.2922 15.6476 16.701 15.0684 15.991 14.6713ZM9.99935 9.91295C9.42249 9.91295 8.85858 9.74189 8.37894 9.4214C7.89929 9.10091 7.52546 8.64539 7.3047 8.11244C7.08394 7.57949 7.02619 6.99304 7.13873 6.42727C7.25127 5.86149 7.52905 5.34179 7.93695 4.93389C8.34486 4.52598 8.86456 4.2482 9.43034 4.13566C9.99611 4.02312 10.5826 4.08088 11.1155 4.30163C11.6485 4.52239 12.104 4.89622 12.4245 5.37587C12.745 5.85551 12.916 6.41942 12.916 6.99628C12.916 7.76983 12.6087 8.51169 12.0617 9.05867C11.5148 9.60566 10.7729 9.91295 9.99935 9.91295ZM13.7493 14.0796C13.4178 14.0796 13.0999 13.9479 12.8655 13.7135C12.631 13.4791 12.4993 13.1611 12.4993 12.8296C12.5015 12.4988 12.6339 12.1821 12.8679 11.9481C13.1018 11.7142 13.4185 11.5818 13.7493 11.5796C14.0809 11.5796 14.3988 11.7113 14.6332 11.9457C14.8677 12.1801 14.9993 12.4981 14.9993 12.8296C14.9993 13.1611 14.8677 13.4791 14.6332 13.7135C14.3988 13.9479 14.0809 14.0796 13.7493 14.0796Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function MealsIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.3 9.32205H17.4587C17.1198 5.16968 14.5963 1.9115 11.4929 1.71588C11.3516 1.15325 10.9642 0.746094 10.5034 0.746094H10.4966C10.0358 0.746094 9.65062 1.15306 9.5102 1.71569C6.40535 1.9095 3.88038 5.16834 3.5413 9.32205H0.7C0.31311 9.32205 0 9.74894 0 10.2754C0 10.8018 0.31311 11.2286 0.7 11.2286H1.59579L1.81699 12.133C2.10343 13.3028 2.90388 14.0885 3.80898 14.0885H5.96869L7.28637 16.4382C7.378 16.6016 7.50582 16.7203 7.65072 16.7766C7.73892 16.8106 9.78558 17.594 12.8262 17.8258L14.4397 19.8756L14.324 19.9661C13.989 20.2282 13.8728 20.8109 14.0656 21.2675C14.1948 21.5743 14.4306 21.7461 14.6733 21.7461C14.7916 21.7461 14.9112 21.7056 15.0213 21.6195L19.4633 18.1457C19.7982 17.8836 19.9144 17.3009 19.7217 16.8442C19.5289 16.3881 19.1017 16.2294 18.766 16.4924L18.6573 16.5774C18.3518 15.6889 17.9164 14.7851 17.5232 14.0528C18.2874 13.887 18.9322 13.1574 19.183 12.1328L19.4042 11.2288H20.3C20.6869 11.2288 21 10.802 21 10.2755C21 9.74913 20.6869 9.32205 20.3 9.32205ZM9.8 3.60227H11.2C13.6633 3.60227 15.7026 6.09362 16.0441 9.32205H4.95593C5.29746 6.09362 7.3367 3.60227 9.8 3.60227ZM15.7102 18.882L13.5953 16.1949C13.4736 16.0408 13.3164 15.95 13.1503 15.9393C10.7003 15.7815 8.86277 15.2253 8.253 15.0199L7.73059 14.0884H15.7695C16.2469 14.8765 17.0503 16.3331 17.4379 17.5308L15.7102 18.882ZM17.8555 11.5298C17.7598 11.9199 17.4924 12.1819 17.191 12.1819H3.80898C3.50749 12.1819 3.24023 11.9199 3.14454 11.5303L3.07076 11.2286H17.9292L17.8555 11.5298Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function MenusIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.625 2.49609H4.375V19.9961H2.625V2.49609ZM8.75 5.99609H14.875V7.74609H8.75V5.99609ZM8.75 9.49609H14.875V11.2461H8.75V9.49609Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M16.625 2.49609H5.25V19.9961H16.625C17.5901 19.9961 18.375 19.2112 18.375 18.2461V4.24609C18.375 3.28097 17.5901 2.49609 16.625 2.49609ZM16.625 18.2461H7V4.24609H16.625V18.2461Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function VendorsIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.8749 7.62109H16.0031L16.1093 6.55728C16.1353 6.29665 16.1064 6.03346 16.0245 5.78467C15.9426 5.53589 15.8095 5.30702 15.6337 5.11283C15.4579 4.91864 15.2434 4.76343 15.004 4.65721C14.7646 4.55098 14.5056 4.4961 14.2436 4.49609H4.50612C4.24414 4.49611 3.98507 4.55103 3.74561 4.65729C3.50615 4.76355 3.29161 4.91881 3.11582 5.11306C2.94003 5.3073 2.80689 5.53622 2.72498 5.78507C2.64307 6.03391 2.6142 6.29716 2.64025 6.55784L3.49618 16.118C3.51297 16.2679 3.48006 15.9569 3.5998 16.5568H1.73043C1.56467 16.5568 1.4057 16.6226 1.28849 16.7398C1.17128 16.857 1.10543 17.016 1.10543 17.1818C1.10543 17.3475 1.17128 17.5065 1.28849 17.6237C1.4057 17.7409 1.56467 17.8068 1.73043 17.8068L16.9999 17.9961C17.1656 17.9961 17.3246 17.9302 17.4418 17.813C17.559 17.6958 17.6249 17.5369 17.6249 17.3711C17.6249 17.2053 17.559 17.0464 17.4418 16.9292C17.3246 16.8119 17.1656 16.7461 16.9999 16.7461H15.1306C15.1826 16.6047 15.2173 16.4576 15.2341 16.3078L15.4404 13.2461H16.8749C17.372 13.2455 17.8486 13.0478 18.2001 12.6963C18.5516 12.3448 18.7493 11.8682 18.7499 11.3711V9.49609C18.7493 8.99898 18.5516 8.52238 18.2001 8.17087C17.8486 7.81936 17.372 7.62164 16.8749 7.62109ZM5.66116 16.5568C5.50612 16.5573 5.35648 16.4999 5.24154 16.3958C5.12661 16.2918 5.05466 16.1486 5.03978 15.9943L4.13771 6.58592C4.12901 6.49898 4.13861 6.41119 4.16591 6.3282C4.1932 6.2452 4.23757 6.16884 4.29617 6.10404C4.35476 6.03924 4.42628 5.98743 4.50612 5.95195C4.58596 5.91647 4.67235 5.8981 4.75971 5.89804L14.0203 5.95195C14.1076 5.952 14.194 5.97035 14.2738 6.00581C14.3536 6.04126 14.4251 6.09304 14.4837 6.1578C14.5423 6.22256 14.5867 6.29888 14.614 6.38183C14.6413 6.46479 14.6509 6.55254 14.6423 6.63945L14.0203 15.9949C14.0053 16.1492 13.9332 16.2923 13.8183 16.3962C13.7033 16.5001 13.5536 16.5574 13.3987 16.5568H5.66116ZM17.4999 11.3711C17.4998 11.5368 17.4339 11.6957 17.3167 11.8129C17.1995 11.9301 17.0406 11.996 16.8749 11.9961H15.5654L15.8779 8.87109H16.8749C17.0406 8.87119 17.1995 8.93707 17.3167 9.05426C17.4339 9.17145 17.4998 9.33036 17.4999 9.49609V11.3711Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function ReviewsIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.49936 19.08H5.8327C5.94237 19.0807 6.05109 19.0596 6.15262 19.0182C6.25415 18.9767 6.3465 18.9156 6.42436 18.8384L16.4244 8.83836C16.5025 8.76089 16.5645 8.66873 16.6068 8.56718C16.6491 8.46563 16.6709 8.3567 16.6709 8.24669C16.6709 8.13668 16.6491 8.02776 16.6068 7.92621C16.5645 7.82466 16.5025 7.7325 16.4244 7.65503L13.091 4.32169C13.0136 4.24359 12.9214 4.18159 12.8198 4.13928C12.7183 4.09698 12.6094 4.0752 12.4994 4.0752C12.3894 4.0752 12.2804 4.09698 12.1789 4.13928C12.0773 4.18159 11.9852 4.24359 11.9077 4.32169L1.9077 14.3217C1.83046 14.3996 1.76936 14.4919 1.72789 14.5934C1.68642 14.695 1.6654 14.8037 1.66603 14.9134V18.2467C1.66603 18.4677 1.75383 18.6797 1.91011 18.836C2.06639 18.9922 2.27835 19.08 2.49936 19.08ZM3.3327 15.255L12.4994 6.08836L14.6577 8.24669L5.49103 17.4134H3.3327V15.255Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M14.7585 2.65426C14.6808 2.57656 14.5885 2.51492 14.487 2.47287C14.3855 2.43082 14.2767 2.40918 14.1668 2.40918C13.9449 2.40918 13.7321 2.49734 13.5752 2.65426C13.4182 2.81118 13.3301 3.024 13.3301 3.24592C13.3301 3.46784 13.4182 3.68067 13.5752 3.83759L16.9085 7.17093C16.986 7.24903 17.0781 7.31103 17.1797 7.35333C17.2812 7.39564 17.3901 7.41742 17.5002 7.41742C17.6102 7.41742 17.7191 7.39564 17.8206 7.35333C17.9222 7.31103 18.0143 7.24903 18.0918 7.17093C18.1699 7.09346 18.2319 7.00129 18.2742 6.89974C18.3165 6.79819 18.3383 6.68927 18.3383 6.57926C18.3383 6.46925 18.3165 6.36033 18.2742 6.25878C18.2319 6.15723 18.1699 6.06506 18.0918 5.98759L14.7585 2.65426Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}

export function UmsIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="6" r="4" stroke={isActive ? "#DC2626" : "#464255"} strokeWidth="1.5" />
            <path d="M15 9C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3" stroke={isActive ? "#DC2626" : "#464255"} strokeWidth="1.5" strokeLinecap="round" />
            <ellipse cx="9" cy="17" rx="7" ry="4" stroke={isActive ? "#DC2626" : "#464255"} strokeWidth="1.5" />
            <path d="M18 14C19.7542 14.3847 21 15.3589 21 16.5C21 17.5293 19.9863 18.4229 18.5 18.8704" stroke={isActive ? "#DC2626" : "#464255"} strokeWidth="1.5" strokeLinecap="round" fill={isActive ? "#DC2626" : "#464255"}/>
        </svg>
    )
}

export function PersIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M19.0159 9.30694C17.4538 7.74486 14.8872 7.77877 13.2833 9.38271C11.6794 10.9866 11.6454 13.5533 13.2075 15.1153C14.7696 16.6774 17.3362 16.6435 18.9402 15.0396C20.5441 13.4356 20.578 10.869 19.0159 9.30694ZM14.4147 10.5141C15.377 9.55171 16.917 9.53139 17.8542 10.4686C18.7915 11.4058 18.7712 12.9458 17.8088 13.9082C16.8464 14.8705 15.3064 14.8909 14.3692 13.9537C13.432 13.0164 13.4523 11.4764 14.4147 10.5141Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M8.59252 17.47C8.27178 17.7908 7.75837 17.7975 7.446 17.4852C7.13363 17.1728 7.14042 16.6594 7.46115 16.3387C7.78189 16.0179 8.29531 16.0111 8.60768 16.3235C8.92005 16.6359 8.91326 17.1493 8.59252 17.47Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M10.8396 20.8778C11.1519 21.1901 11.6653 21.1833 11.9861 20.8626C12.3068 20.5419 12.3136 20.0284 12.0012 19.7161C11.6889 19.4037 11.1754 19.4105 10.8547 19.7312C10.534 20.052 10.5272 20.5654 10.8396 20.8778Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path fillRule="evenodd" clipRule="evenodd" d="M11.617 5.3928C14.1833 2.82649 18.2898 2.77222 20.7892 5.27158L23.0519 7.53432C25.5512 10.0336 25.497 14.1402 22.9307 16.7065L15.9606 23.6766C13.3944 26.2428 9.28775 26.2971 6.78844 23.7978L4.5257 21.535C2.02634 19.0357 2.08066 14.9291 4.64692 12.3628L11.617 5.3928ZM19.6275 6.43325L21.8902 8.69599C23.7648 10.5706 23.724 13.6504 21.7993 15.5751L14.8293 22.5452C12.9045 24.47 9.82468 24.5107 7.95012 22.6361L5.68737 20.3734C3.81286 18.4988 3.85351 15.419 5.77829 13.4942L12.7483 6.52417C14.6731 4.59944 17.753 4.55874 19.6275 6.43325Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}


export function AnalyticsIcon({ isActive }) {
    return (
        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 16.5798H4.16667V3.24642C4.16667 3.02541 4.07887 2.81344 3.92259 2.65716C3.76631 2.50088 3.55435 2.41309 3.33333 2.41309C3.11232 2.41309 2.90036 2.50088 2.74408 2.65716C2.5878 2.81344 2.5 3.02541 2.5 3.24642V17.4131C2.5 17.6341 2.5878 17.8461 2.74408 18.0023C2.90036 18.1586 3.11232 18.2464 3.33333 18.2464H17.5C17.721 18.2464 17.933 18.1586 18.0893 18.0023C18.2455 17.8461 18.3333 17.6341 18.3333 17.4131C18.3333 17.1921 18.2455 16.9801 18.0893 16.8238C17.933 16.6676 17.721 16.5798 17.5 16.5798Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M5.83398 9.91243V14.0791C5.83398 14.3001 5.92178 14.5121 6.07806 14.6684C6.23434 14.8246 6.4463 14.9124 6.66732 14.9124C6.88833 14.9124 7.10029 14.8246 7.25657 14.6684C7.41285 14.5121 7.50065 14.3001 7.50065 14.0791V9.91243C7.50065 9.69142 7.41285 9.47946 7.25657 9.32318C7.10029 9.1669 6.88833 9.0791 6.66732 9.0791C6.4463 9.0791 6.23434 9.1669 6.07806 9.32318C5.92178 9.47946 5.83398 9.69142 5.83398 9.91243Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M9.16602 5.74642V14.0798C9.16602 14.3008 9.25381 14.5127 9.41009 14.669C9.56637 14.8253 9.77834 14.9131 9.99935 14.9131C10.2204 14.9131 10.4323 14.8253 10.5886 14.669C10.7449 14.5127 10.8327 14.3008 10.8327 14.0798V5.74642C10.8327 5.52541 10.7449 5.31344 10.5886 5.15716C10.4323 5.00088 10.2204 4.91309 9.99935 4.91309C9.77834 4.91309 9.56637 5.00088 9.41009 5.15716C9.25381 5.31344 9.16602 5.52541 9.16602 5.74642Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M12.5 7.41243V14.0791C12.5 14.3001 12.5878 14.5121 12.7441 14.6684C12.9004 14.8246 13.1123 14.9124 13.3333 14.9124C13.5543 14.9124 13.7663 14.8246 13.9226 14.6684C14.0789 14.5121 14.1667 14.3001 14.1667 14.0791V7.41243C14.1667 7.19142 14.0789 6.97946 13.9226 6.82318C13.7663 6.6669 13.5543 6.5791 13.3333 6.5791C13.1123 6.5791 12.9004 6.6669 12.7441 6.82318C12.5878 6.97946 12.5 7.19142 12.5 7.41243Z" fill={isActive ? "#DC2626" : "#464255"} />
            <path d="M15.834 3.24642V14.0798C15.834 14.3008 15.9218 14.5127 16.0781 14.669C16.2343 14.8253 16.4463 14.9131 16.6673 14.9131C16.8883 14.9131 17.1003 14.8253 17.2566 14.669C17.4129 14.5127 17.5007 14.3008 17.5007 14.0798V3.24642C17.5007 3.02541 17.4129 2.81344 17.2566 2.65716C17.1003 2.50088 16.8883 2.41309 16.6673 2.41309C16.4463 2.41309 16.2343 2.50088 16.0781 2.65716C15.9218 2.81344 15.834 3.02541 15.834 3.24642Z" fill={isActive ? "#DC2626" : "#464255"} />
        </svg>
    )
}


export function ExpandableIcon({ isExpanded }) {
    return (
        <svg
            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    )
}
