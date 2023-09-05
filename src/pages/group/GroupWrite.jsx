import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/index.jsx';
import WriteImageUpload from '../../components/common/input/WriteImageUpload.jsx';
import Input from '../../components/common/input/Input.jsx';
import FriendSearchModal from '../../components/common/modal/NicknameModal.jsx';
import IconComponents from '../../components/common/iconComponent/IconComponents.jsx';
import { createGroup } from '../../api/groupMainApi';
import { useMutation, useQueryClient } from 'react-query';
import { useToast } from '../../hooks/useToast.jsx';
import {
  BackButton,
  DivHeaderText,
  FriendContentWrap,
  FriendSearchButton,
  FriendSearchText,
  GroupWriteInput,
  ImageInput,
  PlaceAddButton,
  PlaceContainer,
  PlaceInputWrapper,
  PlaceRemoveButton,
  PlaceResult,
  ProfileImage,
  SelectFrindRemover,
  SelectFrindWrapper,
  StDateWrapper,
  SubmitButton,
  ThumbedImage,
  ThumbnailWrapper,
  WriteBody,
  WriteHeader,
  WriteImageWrapper,
  Form,
  DateInput,
  DateInputWraper,
  TitleWraper,
  WordCount,
  ErrorText,
} from './styleContainer';
import DatePicker from '../../components/common/modal/DatePicker.jsx';
import LoadingSpinner from '../../components/common/loading/LoadingSpinner.jsx';

function GroupWrite() {
  const [groupName, setGroupName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [chosenFile, setChosenFile] = useState(null);
  const [place, setPlace] = useState('');
  const [places, setPlaces] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [participants, setParticipant] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isDateModal, setDateModal] = useState(false);

  //error state
  const [groupNameError, setGroupNameError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [placeError, setPlaceError] = useState(false);

  const { showToast } = useToast();

  const searchUser = async (nickname) => {
    try {
      const response = await api.get(`/nickname/${nickname}`, {
        withCredentials: true,
      });

      const userData = response.data;
      console.log('nickname', response);
      console.log(userData);
      setSearchResult(response.data.findByNicknameData);
    } catch (error) {
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.message === '로그인이 필요한 기능입니다.'
      ) {
        console.error('User needs to log in to access this feature.');
      } else {
        console.error('Error fetching user data:', error);
      }
    }
  };
  const placeEnterAdd = (e) => {
    if (e.key === 'Enter' && place.trim() !== '') {
      placeButtonHandler();
      e.preventDefault();
    }
  };

  const preventForceBack = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  //데이터 보내는 로직

  const queryClient = useQueryClient();

  const mutation = useMutation(createGroup, {
    onMutate: () => {},
    onSuccess: () => {
      queryClient.invalidateQueries('groupList');
      navigate('/groupmain');
    },
  });
  const submitHandler = async (e) => {
    e.preventDefault();

    setGroupNameError(false);
    setThumbnailError(false);
    setDateError(false);
    setPlaceError(false);

    let validationPassed = true;

    if (!groupName) {
      setGroupNameError(true);
      validationPassed = false;
    }

    if (!chosenFile) {
      setThumbnailError(true);
      validationPassed = false;
    }

    if (!startDate || !endDate) {
      setDateError(true);
      validationPassed = false;
    }

    if (!places || places.length === 0) {
      setPlaceError(true);
      validationPassed = false;
    }

    if (!validationPassed) return;

    const data = new FormData();
    data.append('thumbnailUrl', chosenFile);
    data.append('groupName', groupName);
    data.append('place', JSON.stringify(places));
    data.append(
      'participant',
      JSON.stringify(selectedFriends.map((friend) => friend.userId.toString()))
    );
    data.append('startDate', startDate);
    data.append('endDate', endDate);
    mutation.mutate(data);
  };

  //이미지 처리하는 로직
  const imageHandler = (e) => {
    const file = e.target.files[0];
    setChosenFile(file);
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setThumbnailUrl(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const universalHandler = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'groupName':
        if (value.length <= 25) {
          setGroupName(value);
        }
        break;
      case 'place':
        setPlace(value);
        break;
      case 'participants':
        setParticipant(value);
        searchUser(value);
        break;
      default:
        break;
    }
  };

  const deletePlaceHandler = (indexToDelete, e) => {
    e.preventDefault();
    setPlaces((prevPlaces) =>
      prevPlaces.filter((_, index) => index !== indexToDelete)
    );
  };

  const navigate = useNavigate();
  const backButtonHandler = () => {
    navigate('/groupmain');
  };

  const placeButtonHandler = () => {
    const newPlaces = place;
    if (places.includes(place)) {
      showToast('이미 추가하신 장소 입니다');
      return;
    }
    setPlaces((prevPlaces) => [...prevPlaces, newPlaces]);
    setPlace('');
  };

  const addFriendHandler = (item) => {
    const newFriend = {
      userId: item.userId,
      loginId: item.loginId,
      nickname: item.nickname,
      profileUrl: item.profileUrl,
    };
    setSelectedFriends((prevFriend) => [...prevFriend, newFriend]);
    setParticipant('');
    setSearchResult([]);
  };

  const removeFriendHandler = (id) => {
    setSelectedFriends((prevfri) => prevfri.filter((item) => item.userId !== id));
  };

  const isUserSelected = (loginId) => {
    return selectedFriends.some((friend) => friend.loginId === loginId);
  };

  return (
    <>
      <Form onSubmit={submitHandler} onKeyPress={preventForceBack}>
        {mutation.isLoading ? <LoadingSpinner /> : null}
        <WriteHeader>
          <div>
            <BackButton onClick={backButtonHandler}>
              <IconComponents iconType='vectorLeft' stroke='#4C4C4C' />
            </BackButton>
          </div>
          <div style={{ fontWeight: '600' }}>앨범 만들기</div>
          <div>
            <SubmitButton type='submit'>확인</SubmitButton>
          </div>
        </WriteHeader>

        <WriteBody>
          <TitleWraper>
            <Input
              color='#4C4C4C'
              theme='underLine'
              name='groupName'
              type='text'
              value={groupName}
              placeholder='앨범 이름을 입력해주세요'
              onChange={universalHandler}
              required
            />
            <WordCount>{groupName.length}/25</WordCount>
            {groupNameError && <ErrorText>앨범 이름을 입력해주세요</ErrorText>}
          </TitleWraper>
          <WriteImageWrapper>
            {thumbnailUrl ? (
              <ThumbnailWrapper>
                <ThumbedImage src={thumbnailUrl} alt='Uploaded Thumbnail' />
                <ImageInput type='file' accept='image/*' onChange={imageHandler} />
              </ThumbnailWrapper>
            ) : (
              <WriteImageUpload
                height='20vh'
                onImageChange={imageHandler}
                bgcolor='rgba(245, 246, 248, 1)'
                color='#BDBDBD'
              >
                썸네일 추가하기
              </WriteImageUpload>
            )}
            {thumbnailError && <ErrorText>썸네일을 추가해주세요</ErrorText>}
          </WriteImageWrapper>
          <StDateWrapper>
            <DivHeaderText>함께한 추억 기간 </DivHeaderText>
            <DateInputWraper>
              <img
                className='inputIcon'
                src={`${process.env.PUBLIC_URL}/assets/image/calander.png`}
                alt='calander'
              />
              <DateInput
                value={startDate && endDate ? `${startDate} ~ ${endDate}` : ''}
                onClick={() => setDateModal(!isDateModal)}
                placeholder='추억을 나눈 날짜를 설정해주세요'
                readOnly
              />
            </DateInputWraper>
            {isDateModal && (
              <DatePicker
                ismodalopen={isDateModal}
                onClose={() => setDateModal(false)}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
            )}
            {dateError && <ErrorText>날짜를 설정해주세요</ErrorText>}
          </StDateWrapper>
          <PlaceContainer>
            <DivHeaderText>함께한 추억 장소</DivHeaderText>
            <PlaceInputWrapper>
              <IconComponents
                iconType='location'
                stroke='#4C4C4C'
                className='inputIcon'
              />
              <GroupWriteInput
                name='place'
                placeholder='추억을 나눈 장소를 입력해주세요'
                value={place}
                onChange={universalHandler}
                onKeyPress={placeEnterAdd}
              />
              {place && (
                <PlaceAddButton className='button' onClick={placeButtonHandler}>
                  추가
                </PlaceAddButton>
              )}
            </PlaceInputWrapper>
            {places.map((place, index) => (
              <PlaceResult key={index}>
                {place}
                <PlaceRemoveButton
                  type='button'
                  onClick={(e) => deletePlaceHandler(index, e)}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/assets/image/cancleplace.png`}
                    alt='left'
                  />
                </PlaceRemoveButton>
              </PlaceResult>
            ))}
            {placeError && <ErrorText>추억장소를 추가해주세요</ErrorText>}
          </PlaceContainer>
          <div style={{ width: '100%' }}>
            <DivHeaderText>함께한 친구들 </DivHeaderText>
            <FriendSearchButton onClick={() => setModalOpen(!isModalOpen)}>
              <FriendContentWrap>
                <IconComponents
                  iconType='search'
                  width='22px'
                  stroke='#4C4C4C'
                  className='inputIcon'
                />
                <FriendSearchText>
                  {' '}
                  추억을 나눈 친구를 검색해주세요{' '}
                </FriendSearchText>
              </FriendContentWrap>
            </FriendSearchButton>
            {isModalOpen && (
              <FriendSearchModal
                ismodalopen={isModalOpen}
                onClose={() => setModalOpen(false)}
                universalHandler={universalHandler}
                isUserSelected={isUserSelected}
                searchResult={searchResult}
                addFriendHandler={addFriendHandler}
                participants={participants}
              />
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '23px',
              marginTop: '14px',
              flexWrap: 'wrap',
            }}
          >
            {selectedFriends &&
              selectedFriends.map((item) => {
                return (
                  <SelectFrindWrapper key={item.userId}>
                    <ProfileImage src={item.profileUrl} alt={item.nickname} />
                    <p> {item.nickname} </p>
                    <SelectFrindRemover
                      onClick={() => removeFriendHandler(item.userId)}
                    >
                      <img
                        src={`${process.env.PUBLIC_URL}/assets/image/friendremover.png`}
                        alt='remover'
                      />
                    </SelectFrindRemover>
                  </SelectFrindWrapper>
                );
              })}
          </div>
        </WriteBody>
      </Form>
    </>
  );
}

export default GroupWrite;
