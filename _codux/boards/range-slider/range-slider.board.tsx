import { useState } from 'react';
import { createBoard } from '@wixc3/react-board';
import { RangeSlider } from '~/lib/components/range-slider/range-slider';

import styles from './range-slider.board.module.scss';

export default createBoard({
    name: 'Range Slider',
    Board: () => {
        const [startValue, setStartValue] = useState(25);
        const [endValue, setEndValue] = useState(75);

        return (
            <div className={styles.container}>
                <RangeSlider
                    className="rangeSlider"
                    startValue={startValue}
                    endValue={endValue}
                    onStartValueChange={setStartValue}
                    onEndValueChange={setEndValue}
                    minValue={0}
                    maxValue={100}
                />
            </div>
        );
    },
    environmentProps: {
        windowWidth: 300,
        windowHeight: 150,
    },
});
