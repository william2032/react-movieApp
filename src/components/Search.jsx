import React from 'react';

const Search = ({searchTerm,setSearchTerm}) => {
    return (
        <div className='search'>
            <div className="flex">
                <img src="/search.svg" alt="search"/>

            <input type="text" placeholder="Search through latest movies" value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)}/>
            </div>
        </div>
    );
};

export default Search;