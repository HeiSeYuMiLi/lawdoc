import { useEffect } from 'react';

function showPagination(currentPage: number, totalPage: number, callback: any) {
    if (totalPage <= 5) {
        return (
            Array(totalPage).fill(0).map((_, index) => (
                <li>
                    <a className={currentPage === (index + 1) ? "pagination-link is-current" : "pagination-link"}
                        onClick={() => callback(index + 1)}>{index + 1}</a>
                </li>
            ))
        )
    } else {
        const part = []
        if (currentPage < 3) {
            if (currentPage === 1) {
                part.push(<li><a className="pagination-link is-current">1</a></li>);
                part.push(<li><a className="pagination-link" onClick={() => callback(2)}>2</a></li>);
            } else {
                part.push(<li><a className="pagination-link" onClick={() => callback(1)}>1</a></li>);
                part.push(<li><a className="pagination-link is-current">2</a></li>);
            }
            part.push(<li><a className="pagination-link" onClick={() => callback(3)}>3</a></li>);
            part.push(<li><span className="pagination-ellipsis">&hellip;</span></li>);
            part.push(<li><a className="pagination-link" onClick={() => callback(totalPage)}>{totalPage}</a></li>);
        } else if (currentPage >= 3 && currentPage <= totalPage - 2) {
            part.push(<li><a className="pagination-link" onClick={() => callback(1)}>1</a></li>);
            part.push(<li><span className="pagination-ellipsis">&hellip;</span></li>);
            part.push(<li><a className="pagination-link" onClick={() => callback(currentPage - 1)}>{currentPage - 1}</a></li>);
            part.push(<li><a className="pagination-link is-current">{currentPage}</a></li>);
            part.push(<li><a className="pagination-link" onClick={() => callback(currentPage + 1)}>{currentPage + 1}</a></li>);
            part.push(<li><span className="pagination-ellipsis">&hellip;</span></li>);
            part.push(<li><a className="pagination-link" onClick={() => callback(totalPage)}>{totalPage}</a></li>);
        } else if (currentPage > totalPage - 2 && currentPage <= totalPage) {
            part.push(<li><a className="pagination-link" onClick={() => callback(1)}>1</a></li>);
            part.push(<li><span className="pagination-ellipsis">&hellip;</span></li>);
            part.push(<li><a className="pagination-link" onClick={() => callback(totalPage - 2)}>{totalPage - 2}</a></li>);
            if (currentPage === totalPage - 1) {
                part.push(<li><a className="pagination-link is-current">{totalPage - 1}</a></li>);
                part.push(<li><a className="pagination-link" onClick={() => callback(totalPage)}>{totalPage}</a></li>);
            } else {
                part.push(<li><a className="pagination-link" onClick={() => callback(totalPage - 1)}>{totalPage - 1}</a></li>);
                part.push(<li><a className="pagination-link is-current">{totalPage}</a></li>);
            }
        }
        return part;
    }

}

export function Pagination({ currentPage, totalPage, callback }: { currentPage: number, totalPage: number, callback: any }) {
    useEffect(() => {
        const button1 = document.getElementById('button1');
        const button2 = document.getElementById('button2');
        if (currentPage === 1) {
            button1?.classList.remove('is-hidden');
            button2?.classList.add('is-hidden');
        } else {
            button1?.classList.add('is-hidden');
            button2?.classList.remove('is-hidden');
        }
        const button3 = document.getElementById('button3');
        const button4 = document.getElementById('button4');
        if (currentPage !== totalPage) {
            button3?.classList.remove('is-hidden');
            button4?.classList.add('is-hidden');
        } else {
            button3?.classList.add('is-hidden');
            button4?.classList.remove('is-hidden');
        }
    }, [currentPage, totalPage]);
    return (
        <nav className="pagination" role="navigation" aria-label="pagination">
            <a id="button1" className="pagination-previous is-disabled" title="已经是第一页了">
                上一页
            </a>
            <a id="button2" className="pagination-previous" onClick={() => callback(currentPage - 1)}>上一页</a>
            <a id="button3" className="pagination-next" onClick={() => callback(currentPage + 1)}>下一页</a>
            <a id="button4" className="pagination-next is-disabled" title="已经是最后一页了">下一页</a>
            <ul className="pagination-list">
                {showPagination(currentPage, totalPage, callback)}
            </ul>
        </nav>
    )
}