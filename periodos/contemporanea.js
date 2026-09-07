/* =========================================================
   ARCADISMO — interações exclusivas desta página
   - carrega imagens opcionais indicadas no HTML
   - permite virar características por clique/toque
   - abre/fecha a ficha rápida em modal
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    /* Imagens opcionais: se o arquivo ainda não existir,
       o placeholder configurado no HTML continua aparecendo. */
    document.querySelectorAll('[data-arc-image]').forEach(slot => {
        const src = slot.dataset.arcImage;
        if (!src) return;

        const img = new Image();
        img.onload = () => {
            slot.style.backgroundImage = `url("${src}")`;
            slot.classList.add('is-loaded');
        };
        img.onerror = () => slot.classList.add('is-placeholder');
        img.src = src;
    });

    /* Flip cards: o hover funciona no computador; clique/toque
       mantém o verso aberto em dispositivos touch. */
    document.querySelectorAll('.arc-flip').forEach(card => {
        const toggle = () => card.classList.toggle('is-flipped');

        card.addEventListener('click', toggle);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });
    });

    /* Carrossel de principais obras */
    const booksTrack = document.querySelector('[data-arc-books-track]');
    const booksPrev = document.querySelector('[data-arc-books-prev]');
    const booksNext = document.querySelector('[data-arc-books-next]');

    if (booksTrack) {
        const scrollAmount = () => Math.max(220, booksTrack.clientWidth * .72);

        const updateBookButtons = () => {
            if (booksPrev) booksPrev.disabled = booksTrack.scrollLeft <= 4;
            if (booksNext) {
                const maxScroll = booksTrack.scrollWidth - booksTrack.clientWidth;
                booksNext.disabled = booksTrack.scrollLeft >= maxScroll - 4;
            }
        };

        booksPrev?.addEventListener('click', () => {
            booksTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });

        booksNext?.addEventListener('click', () => {
            booksTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });

        booksTrack.addEventListener('scroll', updateBookButtons, { passive: true });
        window.addEventListener('resize', updateBookButtons);
        updateBookButtons();

        /* Arrastar o carrossel com o mouse; no celular o gesto nativo continua funcionando. */
        let dragging = false;
        let dragStartX = 0;
        let dragStartScroll = 0;
        let moved = false;

        booksTrack.addEventListener('pointerdown', event => {
            if (event.pointerType === 'touch') return;
            dragging = true;
            moved = false;
            dragStartX = event.clientX;
            dragStartScroll = booksTrack.scrollLeft;
            booksTrack.classList.add('is-dragging');
            booksTrack.setPointerCapture?.(event.pointerId);
        });

        booksTrack.addEventListener('pointermove', event => {
            if (!dragging) return;
            const delta = event.clientX - dragStartX;
            if (Math.abs(delta) > 5) moved = true;
            booksTrack.scrollLeft = dragStartScroll - delta;
        });

        const stopDragging = event => {
            if (!dragging) return;
            dragging = false;
            booksTrack.classList.remove('is-dragging');
            if (event?.pointerId != null) booksTrack.releasePointerCapture?.(event.pointerId);
        };

        booksTrack.addEventListener('pointerup', stopDragging);
        booksTrack.addEventListener('pointercancel', stopDragging);
        booksTrack.addEventListener('pointerleave', event => {
            if (dragging && event.buttons === 0) stopDragging(event);
        });

        /* Enquanto o link ainda estiver com #, evita abrir uma página vazia.
           Quando você trocar pelo endereço do livro, o clique funcionará normalmente. */
        booksTrack.querySelectorAll('.arc-book-cover-link').forEach(link => {
            link.addEventListener('click', event => {
                if (moved || link.getAttribute('href') === '#') event.preventDefault();
                moved = false;
            });
        });
    }

    /* Ficha rápida flutuante */
    const modal = document.querySelector('#arc-ficha-modal');
    const openButton = document.querySelector('[data-arc-open-ficha]');
    const closeButtons = document.querySelectorAll('[data-arc-close-ficha]');
    const closeButton = modal?.querySelector('.arc-modal-close');
    let previousFocus = null;

    const openFicha = () => {
        if (!modal) return;
        previousFocus = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        openButton?.setAttribute('aria-expanded', 'true');
        document.body.classList.add('arc-modal-open');
        window.setTimeout(() => closeButton?.focus(), 180);
    };

    const closeFicha = () => {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        openButton?.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('arc-modal-open');
        window.setTimeout(() => previousFocus?.focus?.(), 120);
    };

    openButton?.addEventListener('click', openFicha);
    closeButtons.forEach(button => button.addEventListener('click', closeFicha));

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal?.classList.contains('is-open')) {
            closeFicha();
        }
    });
});
