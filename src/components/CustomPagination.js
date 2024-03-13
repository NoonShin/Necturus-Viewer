
export function CustomPagination({currentPage, setCurrentPage, totalPages}) {

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 3; // Adjust as needed
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
        let startPage = Math.max(1, currentPage - halfMaxPagesToShow);
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (currentPage <= halfMaxPagesToShow) {
            endPage = Math.min(totalPages, maxPagesToShow);
        } else if (currentPage >= totalPages - halfMaxPagesToShow) {
            startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pageNumbers.push(
                <li key={1}>
                    <button onClick={() => handlePageChange(1)}>1</button>
                </li>
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <li key="ellipsis-start" className={"ellipsis"}>...</li>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <li key={i} className={currentPage === i ? 'active' : ''}>
                    <button onClick={() => handlePageChange(i)}>{i}</button>
                </li>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <li key="ellipsis-end" className={"ellipsis"}>...</li>
                );
            }
            pageNumbers.push(
                <li key={totalPages}>
                    <button onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
                </li>
            );
        }

        return pageNumbers;
    };

    return (
        <div className="pagination">
            <ul>
                <li>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                </li>
                {renderPageNumbers()}
                <li>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </li>
            </ul>
        </div>
    );
}