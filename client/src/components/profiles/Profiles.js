import React,{fragment, useEffect, Fragment} from 'react';
import PropTypes from 'prop-types';
import Spinner from '../layout/spinner';
import {connect} from 'react-redux';
import {getProfiles} from '../../actions/profile';
import ProfileItem from './ProfileItem';

const Profiles = ({getProfiles, profile: {profiles, loading}}) => {
    useEffect(() =>{
        getProfiles();
    }, [getProfiles]);

    return <Fragment>
        {loading ? <Spinner/>:<Fragment>
            <h1 className="large text-primary">Developers</h1>  
            <p className="lead">
                <i className="fab fa-connectdevelop">                    
                </i>
                Browse and connect with profiles
            </p>
            <div className="profiles">
                {profiles.length>0 ?(                    
                   profiles.map(profile => (
                       <ProfileItem key={profile._id} profile={profile}/>
                   ))     
                ): ({loading} ? (<Spinner/>) : (<h4>No profiles found...</h4>))}
            </div> 
            </Fragment>}
    </Fragment>
}

Profiles.propTypes = {
    getProfiles: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    profile: state.profile
});

export default connect(mapStateToProps,{getProfiles})(Profiles);
