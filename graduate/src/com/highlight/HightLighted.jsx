import React from 'react';

export default function HighlightedText({ text, queries }) {
    if (!queries || queries.length === 0) {
        return <>{text}</>; // queries가 없거나 빈 배열인 경우 원래 텍스트를 그대로 반환
    }

    const highlight = (part) => {
        return queries.some((query) => part.toLowerCase() === query.toLowerCase()) ? (
            <mark>{part}</mark>
        ) : (
            part
        );
    };

    const parts = text.split(/\s+/); // 텍스트를 공백으로 나눠 단어들을 배열로 만듦

    return (
        <>
            {parts.map((part, index) => (
                <React.Fragment key={index}>{highlight(part)} </React.Fragment>
            ))}
        </>
    );
}
