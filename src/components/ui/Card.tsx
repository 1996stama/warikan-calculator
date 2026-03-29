import React from "react";

type CardProps = {
    children: React.ReactNode;
    logo: string;
    title: string;
};

const Card = (props: CardProps): JSX.Element => {
    return (
        <div>
            <div></div>
            <h3>{props.title}</h3>
            <div>{props.children}</div>
        </div>
    );
};

export default Card;
