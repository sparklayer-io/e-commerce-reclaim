import { createBoard } from '@wixc3/react-board';
import { BackgroundParallax } from '~/components/visual-effects/background-parallax';
import { FadeIn } from '~/components/visual-effects/fade-in';
import { FloatIn } from '~/components/visual-effects/float-in';
import { Reveal } from '~/components/visual-effects/reveal';

import styles from './visual-effects.board.module.scss';

const image =
    'https://static.wixstatic.com/media/c837a6_a2f541f9274546a9b4b0a8dbd2cfa3e0~mv2.jpg/v1/fill/w_900,h_600,al_c,q_85,enc_auto/11062b_4ba7b420d917404092175a564fa1358b~mv2-1_edited_edited.jpg';

export default createBoard({
    name: 'Visual Effects',
    Board: () => (
        <div className={styles.root}>
            <BackgroundParallax
                className={styles.contrastColor}
                style={{ backgroundImage: `url(${image})` }}
            >
                <h4 className="heading4">Parallax</h4>
            </BackgroundParallax>

            <section>
                <h4 className="heading4">Reveal</h4>
                <Reveal direction="down" duration={3}>
                    <img src={image} alt="" />
                </Reveal>
            </section>

            <section>
                <h4 className="heading4">Float In</h4>
                <FloatIn direction="up" duration={3}>
                    <img src={image} alt="" />
                </FloatIn>
            </section>

            <section>
                <h4 className="heading4">Fade In</h4>
                <FadeIn duration={3}>
                    <img src={image} alt="" />
                </FadeIn>
            </section>
        </div>
    ),
    environmentProps: {
        windowWidth: 400,
        windowHeight: 400,
    },
});
