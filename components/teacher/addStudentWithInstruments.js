import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-bootstrap/Spinner';
import Link from 'next/link';
import { Button } from 'react-bootstrap';
import { FaMusic } from 'react-icons/fa';
import { fetchInstruments, fetchRoster } from '../../actions';
import { getEnrollments } from '../../api';

function StudentsWithInstruments() {
  const userInfo = useSelector((state) => state.currentUser);
  const { items: instruments, loaded: instrumentsLoaded } = useSelector(
    (state) => state.instruments
  );
  const sortedIntruments = instrumentsLoaded
    ? Object.values(instruments).sort((A, B) => A.name > B.name)
    : [];
  const roster = useSelector((state) => state.roster);
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch();

  // Fetch the roster. This is not in an if-statement because the roster would not
  // re-load in a different class.
  dispatch(
        fetchRoster({ djangoToken: userInfo.token, courseSlug: slug })
      );
  useEffect(() => {
    if ('token' in userInfo) {
      if (!instrumentsLoaded) {
        dispatch(fetchInstruments(userInfo.token));
      }
      if ((!roster.loaded && slug) || (roster.loaded && slug && slug !== roster.courseSlug)) {
        dispatch(
          fetchRoster({ djangoToken: userInfo.token, courseSlug: slug })
        );
      }
    }
  }, [dispatch, slug, userInfo]);
  // console.log('state', useSelector((state) => state.roster));

  // Displays a list of students with their instruments
  // FIXME the greater than 1 here is a bit of a hack. because the course will already have the teacher enrollment, simply checking for any enrollment is insufficient to hide this section when there are no students

  console.log('roster', roster)
  return roster?.items && Object.values(roster.items).length > 1 ? (
    <div>
      <h2>Current Students</h2>
      <div className="container">
        {roster?.items && Object.values(roster.items).length && instruments ? (
          Object.values(roster.items)
            .filter((e) => e.role !== 'Teacher')
            .map((enrollment, index) => (
              <div className="row" key={enrollment.id}>
                <div className="col-1">{index + 1}. </div>
                <div className="col-3">{enrollment.user.name}</div>
                <div className="col">
                  {enrollment.instrument &&
                    instruments[enrollment.instrument.id]
                    ? instruments[enrollment.instrument.id].name
                    : 'No Instrument Assigned'}
                </div>
              </div>
            ))
        ) : (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
      </div>
      <Link href={`/courses/${slug}/instruments`}>
        <Button className="my-3" variant="primary">
          Set Instrument Assignments <FaMusic />
        </Button>
      </Link>
    </div>
  ) :
    <div>
      <h2>Current Students</h2>
      Loading Current Students...
      <br />
      <Spinner />
    </div>;
}

export default StudentsWithInstruments;
