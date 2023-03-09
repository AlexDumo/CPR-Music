import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Spinner from 'react-bootstrap/Spinner';
import TranspositionBadge from '../transpositionBadge';
import { getStudentAssignments } from '../../api';
import { ProgressBar } from 'react-bootstrap';
// on the student's course view:
// show the name of the course
// show the assignments that still need to be completed
// show the assignments that have already been completed

export default function StudentTelephoneCourseView({ enrollment }) {
  const router = useRouter();
  const { slug } = router.query;
  const {
    isLoading,
    error: assignmentsError,
    data: assignments,
  } = useQuery('assignments', getStudentAssignments(slug), {
    enabled: !!slug,
  });

  const activitySort = (a, b) => {
    const ordering = {
      Melody: 1,
      Bassline: 2,
      Creativity: 3,
      Reflection: 4,
      Connect: 5,
    };
    const c = a.activity.activity_type.name.split(' ')[0];
    const d = b.activity.activity_type.name.split(' ')[0];
    return ordering[c] - ordering[d];
  };

  function progressAmount(){
    return 50;
  };

  return (
    <Row>
      <Col>
        <h2>Assignments</h2>
        {/* <div className="student-assignments"> */}
        <div className="d-flex align-items-start flex-wrap gap-3">
          {/* eslint-disable no-nested-ternary */}
          {isLoading ? (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : assignments && Object.keys(assignments).length > 0 ? (
            Object.keys(assignments).map((pieceName) => (
              <Card className="student-piece-activity-group w-100" key={pieceName}>
                <Card.Header className="fw-bold"><h5>{pieceName}</h5></Card.Header>
                <div class="row align-items-start px-3 py-2">
                  <div className='col-md-8 d-flex'>
                    <h6>Your Assingment: <b>[Insert Assingments]</b></h6>
                    <button type="button" class="btn btn-primary">Complete [x] Assignments</button>
                  </div>
                  <div className='col-lg-3'>
                  </div>
                </div>
                <div className='row px-5 py-4'>
                    <ProgressBar striped now={progressAmount()} label={`${progressAmount()}%`} />
                </div>
              </Card>
            )) 
          ) : (
            <p>You have no assignments at this time.</p>
          )}
        </div>
      </Col>
    </Row>
  );
}


